from datetime import datetime, timezone
from typing import Optional

from app.services.base_service import BaseService
from app.repository.output_feedback_repository import OutputFeedbackRepository
from app.repository.model_output_repository import ModelOutputRepository
from app.repository.prompt_execution_repository import PromptExecutionRepository
from app.repository.chat_session_repository import ChatSessionRepository

from app.schema.output_feedback_schema import (
    CreateOutputFeedback,
    OutputFeedbackOut,
    OutputFeedbackPage,
    OutputFeedbackItemOut,
)
from app.core.exceptions import NotFoundError, AuthError


class OutputFeedbackService(BaseService):
    def __init__(
        self,
        repository: OutputFeedbackRepository,
        model_output_repo: ModelOutputRepository,
        prompt_exec_repo: PromptExecutionRepository,
        chat_session_repo: ChatSessionRepository,
    ):
        super().__init__(repository)
        self.repo = repository
        self.mo_repo = model_output_repo
        self.exec_repo = prompt_exec_repo
        self.session_repo = chat_session_repo

    def add(self, payload: CreateOutputFeedback, user_id: int, user_email: Optional[str]) -> OutputFeedbackOut:
        mo = self.mo_repo.read_by_id(int(payload.model_output_id))
        if not mo or getattr(mo, "deleted", 0) == 1:
            raise NotFoundError(detail="Model output not found")

        pe_id = getattr(mo, "prompt_execution_id", None)
        if not pe_id:
            raise NotFoundError(detail="Prompt execution not found for this output")

        pe = self.exec_repo.read_by_id(int(pe_id))
        if not pe or getattr(pe, "deleted", 0) == 1:
            raise NotFoundError(detail="Prompt execution not found")

        session = self.session_repo.read_by_id(int(pe.session_id))
        if not session or getattr(session, "deleted", 0) == 1:
            raise NotFoundError(detail="Session not found")

        if int(session.created_by) != int(user_id):
            raise AuthError(detail="Forbidden")

        payload.created_by = user_id
        payload.created_by_email = user_email
        payload.created_at = datetime.now(timezone.utc)
        payload.deleted = 0

        obj = self.repo.create_feedback(payload)
        return OutputFeedbackOut.model_validate(obj)

    def list_for_prompt(self, prompt_id: int, page: int = 1, per_page: int = 5) -> OutputFeedbackPage:
        rows, meta = self.repo.list_for_prompt(prompt_id, page=page, per_page=per_page)
        items = [OutputFeedbackItemOut(**row) for row in rows]
        return OutputFeedbackPage(items=items, meta=meta)

    def list_for_version(self, version_id: int, page: int = 1, per_page: int = 5) -> OutputFeedbackPage:
        rows, meta = self.repo.list_for_version(version_id, page=page, per_page=per_page)
        items = [OutputFeedbackItemOut(**row) for row in rows]
        return OutputFeedbackPage(items=items, meta=meta)

    def get_feedback_details(self, feedback_id: int) -> OutputFeedbackItemOut:
        data = self.repo.get_details(feedback_id)
        if not data:
            raise NotFoundError(detail="Feedback not found")
        return OutputFeedbackItemOut(**data)
