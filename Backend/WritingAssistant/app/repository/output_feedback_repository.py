from contextlib import AbstractContextManager
from typing import Callable
from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.output_feedback import OutputFeedback
from app.schema.output_feedback_schema import CreateOutputFeedback

class OutputFeedbackRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, OutputFeedback)

    def create_feedback(self, schema: CreateOutputFeedback) -> OutputFeedback:
        with self.session_factory() as s:
            obj = OutputFeedback(**schema.dict())
            s.add(obj)
            s.commit()
            s.refresh(obj)
            return obj
