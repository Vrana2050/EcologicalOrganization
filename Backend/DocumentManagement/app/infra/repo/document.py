from sqlalchemy.orm.session import Session

from app.api.dtos.documents import DocumentCreateDTO
from app.domain.document import Document, DocumentFile
from app.infra.mappers.document import document_to_db, document_file_to_db, document_from_db
from app.infra.tables import Documents


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

    def get_by_id(self, document_id: int) -> Document:
        doc = self.db.query(Documents).filter(Documents.id == document_id).first()
        return document_from_db(doc)