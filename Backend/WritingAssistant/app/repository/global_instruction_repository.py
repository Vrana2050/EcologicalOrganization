from contextlib import AbstractContextManager
from typing import Callable, Optional

from sqlalchemy.orm import Session

from app.model.global_instruction import GlobalInstruction
from app.repository.base_repository import BaseRepository


class GlobalInstructionRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, GlobalInstruction)

    def get_latest_for_session(self, session_id: int) -> Optional[GlobalInstruction]:
        with self.session_factory() as session:
            q = session.query(self.model).filter(self.model.session_id == session_id)
            if hasattr(self.model, "deleted"):
                q = q.filter(self.model.deleted == 0)
            return q.order_by(self.model.created_at.desc(), self.model.id.desc()).first()
