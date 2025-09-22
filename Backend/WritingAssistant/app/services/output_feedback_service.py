from datetime import datetime, timezone

from app.services.base_service import BaseService
from app.repository.output_feedback_repository import OutputFeedbackRepository
from app.repository.model_output_repository import ModelOutputRepository
from app.repository.prompt_execution_repository import PromptExecutionRepository
from app.repository.chat_session_repository import ChatSessionRepository
from app.schema.output_feedback_schema import CreateOutputFeedback, OutputFeedbackOut
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

    def add(self, payload: CreateOutputFeedback, user_id: int) -> OutputFeedbackOut:
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

        # 3) kreiraj feedback
        payload.created_by = user_id
        payload.created_at = datetime.now(timezone.utc)
        payload.deleted = 0

        obj = self.repo.create_feedback(payload)

        return OutputFeedbackOut(
            id=obj.id,
            model_output_id=obj.model_output_id,
            rating_value=obj.rating_value,
            comment_text=obj.comment_text,
            created_by=obj.created_by,
            created_at=obj.created_at,
        )
