from typing import List
from app.repository.session_section_repository import SessionSectionRepository
from app.repository.chat_session_repository import ChatSessionRepository
from app.services.base_service import BaseService
from app.core.exceptions import NotFoundError
from app.schema.session_overview_schema import SessionSectionWithLatestOut

from app.schema.section_iteration_schema import (
    SectionIterationOut,
    SectionInstructionOut,
    ModelOutputOut,
)



class SessionSectionService(BaseService):
    def __init__(self, repository: SessionSectionRepository, chat_session_repository: ChatSessionRepository):
        self.session_section_repository = repository
        self.chat_session_repository = chat_session_repository
        super().__init__(repository)

    def add(self, schema):
        return self.session_section_repository.create(schema)

    def remove_by_id(self, id: int, user_id: int):
        section = self.session_section_repository.read_by_id(id)
        chat_session = self.chat_session_repository.read_by_id(section.session_id)

        if chat_session.created_by != user_id:
            raise NotFoundError(detail="You are not allowed to delete this section")

        return self.session_section_repository.delete_by_id(id)
    
    def list_with_latest_for_session(self, session_id: int, user_id: int) -> List[SessionSectionWithLatestOut]:
        session_obj = self.chat_session_repository.read_by_id(session_id)
        if session_obj.created_by != user_id:
            raise NotFoundError(detail="Session not found")


        sections, iter_map = self.session_section_repository.list_with_latest_iteration(session_id)

        out: List[SessionSectionWithLatestOut] = []
        for sec in sections:
            it = iter_map.get(sec.id)
            latest = None
            if it:
                latest = SectionIterationOut(
                    id=int(it.id),
                    seq_no=int(it.seq_no),

                    session_section_id = int(it.session_section_id),
                    section_instruction=(
                        SectionInstructionOut.model_validate(it.section_instruction)
                        if it.section_instruction and it.section_instruction.deleted == 0
                        else None
                    ),
                    model_output=(
                        ModelOutputOut.model_validate(it.model_output)
                        if it.model_output and it.model_output.deleted == 0
                        else None
                    ),
                )
            out.append(
                SessionSectionWithLatestOut(
                    id=int(sec.id),
                    session_id=int(sec.session_id),
                    name=sec.name,
                    position=int(sec.position) if sec.position is not None else None,
                    latest_iteration=latest,
                )
            )
        return out
