from contextlib import AbstractContextManager
from typing import Callable, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.repository.base_repository import BaseRepository
from app.model.document_type import DocumentType
from app.core.exceptions import NotFoundError
from app.schema.document_type_schema import CreateDocumentType

class DocumentTypeRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, DocumentType)

    def read_by_id_including_deleted(self, id: int) -> DocumentType:
        with self.session_factory() as s:
            obj = s.query(DocumentType).filter(DocumentType.id == id).first()
            if not obj:
                raise NotFoundError(detail=f"DocumentType not found id: {id}")
            return obj

    def get_by_name_ci(self, name: str) -> Optional[DocumentType]:
        with self.session_factory() as s:
            return (
                s.query(DocumentType)
                .filter(func.lower(DocumentType.name) == func.lower(name),
                        DocumentType.deleted == 0)
                .first()
            )

    def get_by_name_ci_any(self, name: str) -> Optional[DocumentType]:
        with self.session_factory() as s:
            return (
                s.query(DocumentType)
                .filter(func.lower(DocumentType.name) == func.lower(name))
                .first()
            )
        
    def get_any_by_name(self, name: str) -> Optional[DocumentType]:
        with self.session_factory() as s:
            return (
                s.query(DocumentType)
                .filter(func.lower(DocumentType.name) == func.lower(name))
                .first()
            )

    def get_active_duplicate(self, name: str, exclude_id: int | None = None) -> Optional[DocumentType]:
        with self.session_factory() as s:
            q = s.query(DocumentType).filter(
                func.lower(DocumentType.name) == func.lower(name),
                DocumentType.deleted == 0,
            )
            if exclude_id:
                q = q.filter(DocumentType.id != exclude_id)
            return q.first()

    def create(self, schema: CreateDocumentType) -> DocumentType:
        with self.session_factory() as s:
            obj = DocumentType(**schema.dict(exclude_none=True))
            s.add(obj)
            s.commit()
            s.refresh(obj)
            return obj

    def update_entity(self, obj: DocumentType) -> DocumentType:
        with self.session_factory() as s:
            obj.updated_at = func.current_timestamp()
            s.add(obj)
            s.commit()
            s.refresh(obj)
            return obj

