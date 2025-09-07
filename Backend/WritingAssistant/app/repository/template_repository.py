from contextlib import AbstractContextManager
from typing import Callable
from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.template import Template


class TemplateRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, Template)

