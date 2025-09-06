from contextlib import AbstractContextManager
from typing import Callable, Optional
from sqlalchemy.orm import Session
from app.repository.base_repository import BaseRepository
from app.model.prompt_active_history import PromptActiveHistory
from app.model.prompt_version import PromptVersion
from app.core.exceptions import NotFoundError

class PromptActiveHistoryRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, PromptActiveHistory)

    def get_active_prompt_version(self, document_type_id: int) -> PromptVersion:
        with self.session_factory() as s:
            pv = (
                s.query(PromptVersion)
                 .join(PromptActiveHistory, PromptActiveHistory.prompt_version_id == PromptVersion.id)
                 .filter(
                     PromptActiveHistory.document_type_id == document_type_id,
                     PromptActiveHistory.deleted == 0,
                     PromptVersion.deleted == 0,
                 )
                 .order_by(PromptActiveHistory.activated_at.desc())
                 .first()
            )
            if not pv:
                raise NotFoundError(detail="Active prompt version not configured for this document type")
            return pv
