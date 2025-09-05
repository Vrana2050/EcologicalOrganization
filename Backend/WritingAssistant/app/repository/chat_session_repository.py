from contextlib import AbstractContextManager
from typing import Callable

from sqlalchemy.orm import Session

from app.model.chat_session import ChatSession
from app.repository.base_repository import BaseRepository


class ChatSessionRepository(BaseRepository):
    DEFAULT_ORDERING = "-updated_at"   
    DEFAULT_PER_PAGE = 20

    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, ChatSession)

        