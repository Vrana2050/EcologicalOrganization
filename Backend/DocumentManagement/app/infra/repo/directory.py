import os
from datetime import datetime, UTC

from sqlalchemy.orm.session import Session

from app.constants import SHARED_DIRECTORY_NAME, AUDIT_LOG_REPORTS_DIRECTORY_NAME, ACTIVITY_REPORTS_DIRECTORY_NAME
from app.infra.mappers.directory import domain_to_db, db_to_domain, directory_from_db
from app.domain.directory import Directory, RetentionType, DirectoryType
from app.infra.tables import Directories, Tags, TagAssignments, Documents
from sqlalchemy import text

from app.use_cases.tag import TagService


class DirectoryRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Directory | None:
        dir = self.db.query(Directories).filter(Directories.id == id).first()
        return directory_from_db(dir) if dir else None

    def get_by_name_in_directory(self, name: str, parent_id: int) -> Directory | None:
        db_obj = self.db.query(Directories).filter(Directories.name == name).filter(Directories.parent_directory_id == parent_id).first()
        return db_to_domain(db_obj) if db_obj else None

    def save(self, directory: Directory) -> Directory:
        saved_directory = domain_to_db(directory)
        self.db.add(saved_directory)
        self.db.commit()
        self.db.refresh(saved_directory)
        return directory_from_db(saved_directory)

    def create_shared_for_employee(self, employee_id: int) -> Directory:
        shared_directory = domain_to_db(Directory(
            id=None,
            name=SHARED_DIRECTORY_NAME,
            created_at=datetime.now(UTC),
            creator_id=employee_id,
            last_modified=datetime.now(UTC),
            retention_type=RetentionType.INHERITED,
            directory_type=DirectoryType.SYSTEM,
            parent_directory_id=None,
            retention_id=None))

        self.db.add(shared_directory)
        self.db.commit()
        self.db.refresh(shared_directory)
        return directory_from_db(shared_directory)


    def get_shared_directory(self, employee_id: int) -> Directory | None:
        db_dir = self.db.query(Directories).filter(Directories.creator_id == employee_id,
                                                              Directories.name == SHARED_DIRECTORY_NAME,
                                                              Directories.directory_type == DirectoryType.SYSTEM).first()
        if db_dir:
            return db_to_domain(db_dir)
        return None

    def get_subdirectories(self, parent_directory_id, user_id):
        sql = text("""
                   SELECT p.id, p.directory_id, pv.access_type, d.name, d.created_at, d.last_modified, d.creator_id
                   FROM Permissions p
                            JOIN Permission_Values pv ON p.permission_value_id = pv.id
                            JOIN Directories d ON d.id = p.directory_id
                   WHERE p.id IN (SELECT COLUMN_VALUE
                                  FROM TABLE(get_effective_permissions(:user_id, :parent_directory_id, 'DIRECTORY')))
                   """)
        result = self.db.execute(sql, {"user_id": user_id, "parent_directory_id": parent_directory_id})
        return result.mappings().all()

    def get_subdocuments(self, parent_directory_id, user_id):
        sql = text("""
                   SELECT p.id, p.document_id, pv.access_type, d.name, d.created_at, d.last_modified, d.creator_id
                   FROM Permissions p
                            JOIN Permission_Values pv ON p.permission_value_id = pv.id
                            JOIN Documents d ON d.id = p.document_id
                   WHERE p.id IN (SELECT COLUMN_VALUE
                                  FROM TABLE(get_effective_permissions(:user_id, :parent_directory_id, 'DOCUMENT')))
                   """)
        result = self.db.execute(sql, {"user_id": user_id, "parent_directory_id": parent_directory_id})
        return result.mappings().all()

    def get_tags_for_directory(self, directory_id) -> list[str]:
        tags = (
            self.db.query(Tags.name)
            .join(TagAssignments, TagAssignments.tag_id == Tags.id)
            .filter(TagAssignments.directory_id == directory_id)
            .all()
        )
        return [t[0] for t in tags]

    def get_tags_for_document(self, document_id: int) -> list[str]:
        tags = (
            self.db.query(Tags.name)
            .join(TagAssignments, TagAssignments.tag_id == Tags.id)
            .filter(TagAssignments.document_id == document_id)
            .all()
        )
        return [t[0] for t in tags]

    def rename_directory(self, directory_id, directory_name):
        db_dir = self.db.query(Directories).filter(Directories.id == directory_id).first()
        if not db_dir:
            return None

        db_dir.name = directory_name

        self.db.flush()
        self.db.refresh(db_dir)
        return db_to_domain(db_dir)




    def delete(self, directory_id: int) -> list[int] | None:
        db_dir = self.db.query(Directories).filter(Directories.id == directory_id).first()
        if not db_dir:
            return None

        def collect_subdirectories(dir_id: int) -> list[int]:
            subdirs = self.db.query(Directories.id).filter(Directories.parent_directory_id == dir_id).all()
            all_ids = []
            for (sub_id,) in subdirs:
                all_ids.append(sub_id)
                all_ids.extend(collect_subdirectories(sub_id))
            return all_ids

        dir_ids_to_delete = collect_subdirectories(directory_id)
        dir_ids_to_delete.append(directory_id)

        docs = self.db.query(Documents).filter(Documents.parent_directory_id.in_(dir_ids_to_delete)).all()
        for doc in docs:
            for file in doc.document_files:
                path = file.physical_path
                if path and os.path.exists(path):
                    try:
                        os.remove(path)
                    except Exception as e:
                        print(f"⚠️ Error deleting file {path}: {e}")

        # brisanje glavnog direktorijuma (baza će kaskadno obrisati ostalo) ---
        self.db.delete(db_dir)
        self.db.commit()
        return dir_ids_to_delete

    def get_directory_ids_by_name(self, directory_name) -> list[int]:
        dirs = (
            self.db.query(Directories.id)
            .filter(Directories.name == directory_name)
            .all()
        )
        return [dir[0] for dir in dirs]

    def get_audit_log_reports(self) -> int:
        dir = (
            self.db.query(Directories.id)
            .filter(Directories.name == AUDIT_LOG_REPORTS_DIRECTORY_NAME,
                    Directories.directory_type == DirectoryType.SYSTEM)
            .first()
        )
        return dir[0]

    def get_activity_report_directory_id(self) -> int:
        dir = (
            self.db.query(Directories.id)
            .filter(Directories.name == ACTIVITY_REPORTS_DIRECTORY_NAME,
                    Directories.directory_type == DirectoryType.SYSTEM)
            .first()
        )
        return dir[0]



