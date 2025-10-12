import os
from datetime import datetime, UTC
from math import ceil

from sqlalchemy.orm.session import Session
from sqlalchemy import text

from app.api.dtos.documents import DocumentCreateDTO
from app.api.dtos.search import SearchResults, map_directory_to_result, map_document_to_result
from app.domain.document import Document, DocumentFile
from app.infra.mappers.document import document_to_db, document_file_to_db, document_from_db
from app.infra.tables import Documents, DocumentFiles, Directories
import cx_Oracle


class DocumentRepository:

    def __init__(self, db: Session):
        self.db = db

    def save(self, document: Document, document_file: DocumentFile) -> Document:
        created_document = document_to_db(document)
        self.db.add(created_document)
        self.db.flush()
        document_file.document_id = created_document.id
        document_file.generate_physical_path()
        created_document_file = document_file_to_db(document_file)
        self.db.add(created_document_file)
        self.db.commit()

        return document_from_db(created_document)

    def save_new_version(self, document: Document, document_file: DocumentFile) -> Document:
        db_doc = self.db.query(Documents).filter(Documents.id == document.id).first()
        if not db_doc:
            return None

        db_doc.name = db_doc.name.split('.')[0] + document_file.file_type
        db_doc.active_version = document_file.version
        db_doc.last_modified = document.last_modified

        self.db.commit()
        self.db.refresh(db_doc)
        document_file.generate_physical_path()
        created_document_file = document_file_to_db(document_file)
        self.db.add(created_document_file)
        self.db.commit()

        return document_from_db(db_doc)

    def get_by_id(self, document_id: int) -> Document:
        doc = self.db.query(Documents).filter(Documents.id == document_id).first()
        return document_from_db(doc)

    def get_highest_permission_for_document(self, document_id, user_id):
            sql = text("""
                       WITH ugroups AS (SELECT gm.group_id
                                        FROM group_members gm
                                        WHERE gm.user_id = :user_id),
                            ranked_permissions AS (SELECT p.document_id,
                                                          pv.access_type,
                                                          CASE pv.access_type
                                                              WHEN 'EDITOR' THEN 3
                                                              WHEN 'VIEWER' THEN 2
                                                              WHEN 'PREVIEW' THEN 1
                                                              END AS access_rank
                                                   FROM permissions p
                                                            JOIN permission_values pv ON pv.id = p.permission_value_id
                                                   WHERE p.document_id = :document_id
                                                     AND (
                                                       p.user_id = :user_id
                                                           OR p.group_id IN (SELECT group_id FROM ugroups)
                                                       ))
                       SELECT rp.document_id,
                              d.name,
                              CASE MAX(rp.access_rank)
                                  WHEN 3 THEN 'EDITOR'
                                  WHEN 2 THEN 'VIEWER'
                                  WHEN 1 THEN 'PREVIEW'
                                  END AS access_type
                       FROM ranked_permissions rp
                                JOIN documents d ON d.id = rp.document_id
                       GROUP BY rp.document_id, d.name
                       """)
            result = self.db.execute(sql, {"user_id": user_id, "document_id": document_id})
            return result.mappings().first()

    def update_version(self, document: Document):
        db_doc = self.db.query(Documents).filter(Documents.id == document.id).first()
        if not db_doc:
            return None

        db_doc.name = document.name
        db_doc.active_version = document.active_version
        db_doc.last_modified = datetime.now(UTC)

        self.db.commit()
        self.db.refresh(db_doc)
        return db_doc

    def rename_document(self, document_id, document_name):
        db_doc = self.db.query(Documents).filter(Documents.id == document_id).first()
        if not db_doc:
            return None

        extension = '.' + db_doc.name.split('.')[-1]
        db_doc.name = document_name + extension

        self.db.flush()
        self.db.refresh(db_doc)
        return db_doc

    def add_summary(self, document_id, summary):
        db_doc = self.db.query(Documents).filter(Documents.id == document_id).first()
        db_file = self.db.query(DocumentFiles).filter(DocumentFiles.document_id == document_id,
                                                      DocumentFiles.version == db_doc.active_version).first()
        if not db_file:
            return False

        db_file.summary = summary

        self.db.commit()
        return True

    def delete(self, document_id):
        db_doc = self.db.query(Documents).filter(Documents.id == document_id).first()
        if not db_doc:
            return False

        file_paths = self.db.query(DocumentFiles.physical_path).filter(
            DocumentFiles.document_id == document_id
        ).all()

        for (path,) in file_paths:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception as e:
                    print(f"Error deleting file {path}: {e}")



        self.db.delete(db_doc)
        self.db.commit()
        return True

    def return_all_documents_and_directories_for_user(self, page, page_size, allowed_directory_ids,
                                                      allowed_document_ids):
        offset = (page - 1) * page_size
        limit = page_size


        total_directories = (
            self.db.query(Directories)
            .filter(Directories.id.in_(allowed_directory_ids))
            .count()
        )
        total_documents = (
            self.db.query(Documents)
            .filter(Documents.id.in_(allowed_document_ids))
            .count()
        )
        total_count = total_directories + total_documents
        total_pages = ceil(total_count / page_size) if total_count else 1


        directories = []
        documents = []

        if offset < total_directories:
            directories_query = (
                self.db.query(Directories)
                .filter(Directories.id.in_(allowed_directory_ids))
                .offset(offset)
                .limit(limit)
            )
            directories = directories_query.all()
            taken = len(directories)
            limit -= taken
            offset = 0
        else:
            offset -= total_directories

        if limit > 0:
            documents_query = (
                self.db.query(Documents)
                .filter(Documents.id.in_(allowed_document_ids))
                .offset(offset)
                .limit(limit)
            )
            documents = documents_query.all()

        directory_results = [map_directory_to_result(d) for d in directories]
        document_results = [map_document_to_result(doc) for doc in documents]


        return SearchResults(
            directories=directory_results,
            documents=document_results,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    def get_analytics_report(self, year_month: str):
        """
               Poziva proceduru get_analytics_report(p_month, p_report OUT t_analytics_table)
               i vraća rezultat kao Python listu dict-ova.
               """
        # Dobavi nativnu Oracle konekciju
        connection = self.db.connection().connection  # SQLAlchemy -> cx_Oracle konekcija
        cursor = connection.cursor()

        # Pripremi izlazni parametar tipa tabela
        out_param = cursor.var(cx_Oracle.OBJECT, typename="T_ANALYTICS_TABLE")

        # Poziv procedure
        cursor.callproc("GET_ANALYTICS_REPORT", [year_month, out_param])

        # Pretvori rezultat iz Oracle kolekcije u Python listu
        result_collection = out_param.getvalue()
        results = []

        if result_collection:
            for row in result_collection.aslist():
                results.append({
                    "user_email": row.USER_EMAIL,
                    "object_type": row.OBJECT_TYPE,
                    "create_count": row.CREATE_COUNT,
                    "delete_count": row.DELETE_COUNT,
                    "edit_count": row.EDIT_COUNT,
                    "move_count": row.MOVE_COUNT,
                    "download_count": row.DOWNLOAD_COUNT,
                    "preview_count": row.PREVIEW_COUNT,
                    "total_actions": row.TOTAL_ACTIONS,
                    "avg_per_day": row.AVG_PER_DAY,
                    "first_action": row.FIRST_ACTION,
                    "last_action": row.LAST_ACTION
                })

        cursor.close()
        return results

