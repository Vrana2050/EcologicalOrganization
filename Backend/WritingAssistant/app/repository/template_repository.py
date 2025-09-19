from contextlib import AbstractContextManager
from typing import Callable
from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.template import Template

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

