from contextlib import AbstractContextManager
from typing import Callable, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.model.chat_session import ChatSession
from app.repository.base_repository import BaseRepository

class ChatSessionRepository(BaseRepository):
    DEFAULT_ORDERING = "-updated_at"
    DEFAULT_PER_PAGE = 20

    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, ChatSession)

    def search_by_term(self, user_id: int, term: str, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        term = (term or "").strip()
        pattern = f"%{term.upper()}%"

        with self.session_factory() as s:
            base = (
                s.query(ChatSession)
                .filter(
                    ChatSession.deleted == 0,
                    ChatSession.created_by == user_id,
                )
            ).filter(func.upper(ChatSession.title).like(pattern))

            ordered = base.order_by(ChatSession.updated_at.desc())

            rows = (
                ordered.all()
                if per_page == "all"
                else ordered.limit(per_page).offset((page - 1) * per_page).all()
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
