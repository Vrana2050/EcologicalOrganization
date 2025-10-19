from contextlib import AbstractContextManager
from typing import Callable
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_

from app.repository.base_repository import BaseRepository
from app.model.template import Template
from app.model.document_type import DocumentType
from app.core.exceptions import NotFoundError


class TemplateRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, Template)

    def find_by_name(self, name: str) -> Template:
        with self.session_factory() as session:
            query = session.query(self.model).filter(
                self.model.name.ilike(name),
                getattr(self.model, "deleted", 0) == 0
            ).first()
            if not query:
                raise NotFoundError(detail=f"Template with name '{name}' not found")
            return query

    def search_by_term(self, term: str, page: int = 1, per_page: int = 20):
        term = (term or "").strip()
        pattern = f"%{term}%"

        with self.session_factory() as s:
            base = (
                s.query(self.model)
                .options(joinedload(self.model.document_type))  
                .outerjoin(DocumentType, DocumentType.id == self.model.document_type_id)
                .filter(
                    getattr(self.model, "deleted", 0) == 0,
                    or_(
                        self.model.name.ilike(pattern),
                        func.coalesce(DocumentType.name, "").ilike(pattern),
                    ),
                )
            )

            ordered = base.order_by(self.model.updated_at.desc())

            rows = (
                ordered.all()
                if per_page == "all"
                else ordered.limit(per_page).offset((page - 1) * int(per_page)).all()
            )
            total = base.count()

            return {
                "founds": rows,
                "search_options": {
                    "page": page,
                    "per_page": per_page,
                    "ordering": "-updated_at",
                    "total_count": total,
                },
            }
