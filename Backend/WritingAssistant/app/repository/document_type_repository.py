from contextlib import AbstractContextManager
from typing import Callable, Optional
from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.document_type import DocumentType
from app.core.exceptions import NotFoundError, DuplicatedError

class DocumentTypeRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, DocumentType)

    def get_by_name(self, name: str) -> Optional[DocumentType]:
        with self.session_factory() as s:
            return s.query(DocumentType).filter(
                DocumentType.name == name,
                DocumentType.deleted == 0
            ).first()


