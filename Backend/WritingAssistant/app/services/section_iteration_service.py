from app.services.base_service import BaseService
from app.repository.section_iteration_repository import SectionIterationRepository
from app.repository.session_section_repository import SessionSectionRepository
from app.repository.chat_session_repository import ChatSessionRepository
from app.core.exceptions import AuthError, NotFoundError
from app.model.session_section import SessionSection

class SectionIterationService(BaseService):
    def __init__(
        self,
        repository: SectionIterationRepository,
        session_section_repository: SessionSectionRepository,
        chat_session_repository: ChatSessionRepository,
    ):
        super().__init__(repository)
        self._sec_repo = session_section_repository
        self._sess_repo = chat_session_repository
        self._iter_repo = repository

    def get_by_seq(self, section_id: int, seq_no: int, user_id: int):
        section = self._sec_repo.read_by_id(section_id, eagers=[SessionSection.session])

        if section.session.created_by != user_id:
            raise AuthError(detail="Forbidden")

        if section.deleted == 1:
            raise NotFoundError(detail="Section not found")

        iteration = self._iter_repo.by_section_and_seq(section_id, seq_no)
        if not iteration:
            raise NotFoundError(detail="Iteration not found")


        return iteration
