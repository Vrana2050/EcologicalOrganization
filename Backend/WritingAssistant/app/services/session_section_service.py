from typing import List
from app.repository.session_section_repository import SessionSectionRepository
from app.repository.chat_session_repository import ChatSessionRepository
from app.repository.global_instruction_repository import GlobalInstructionRepository
from app.services.base_service import BaseService
from app.core.exceptions import NotFoundError, AuthError
from app.schema.session_overview_schema import SessionSectionWithLatestOut, SessionOverviewOut

from app.schema.section_iteration_schema import SectionIterationOut, SectionInstructionOut, ModelOutputOut
from app.schema.session_section_schema import PatchSessionSectionTitle

from datetime import datetime, timezone

from app.model.session_section import SessionSection




class SessionSectionService(BaseService):
    def __init__(self, repository: SessionSectionRepository, chat_session_repository: ChatSessionRepository, global_instruction_repository: GlobalInstructionRepository,):
        self.session_section_repository = repository
        self.chat_session_repository = chat_session_repository
        self.global_instruction_repository = global_instruction_repository
        super().__init__(repository)

    def add(self, schema):
        return self.session_section_repository.create(schema)

    def remove_by_id(self, id: int, user_id: int):
        section = self.session_section_repository.read_by_id(id)
        chat_session = self.chat_session_repository.read_by_id(section.session_id)

        if chat_session.created_by != user_id:
            raise AuthError(detail="You are not allowed to delete this section")  

        self.session_section_repository.delete_by_id(id)

    def update_title(self, session_section_id: int, name: str, user_id: int):
        section = self.session_section_repository.read_by_id(session_section_id, eagers=([SessionSection.session]))
        if section.session.created_by != user_id:
            raise AuthError(detail="You can rename only your conversations!")

        patch = PatchSessionSectionTitle(name=name, updated_at=datetime.now(timezone.utc))
        return self.session_section_repository.update(session_section_id, patch)
    
    def list_with_latest_for_session(self, session_id: int, user_id: int) -> SessionOverviewOut:
        session_obj = self.chat_session_repository.read_by_id(session_id)
        if session_obj.created_by != user_id:
            raise NotFoundError(detail="Session not found")

        sections, iter_map = self.session_section_repository.list_with_latest_iteration(session_id)
        gi = self.global_instruction_repository.get_latest_for_session(session_id)
        gi_text = gi.text_ if gi and getattr(gi, "text_", None) else ""

        title = session_obj.title
        document_type_id = session_obj.document_type_id

        out_sections: List[SessionSectionWithLatestOut] = []
        for sec in sections:
            it = iter_map.get(sec.id)
            latest = None
            if it:
                latest = SectionIterationOut(
                    id=int(it.id),
                    seq_no=int(it.seq_no),
                    session_section_id=int(it.session_section_id),
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
            out_sections.append(
                SessionSectionWithLatestOut(
                    id=int(sec.id),
                    session_id=int(sec.session_id),
                    name=sec.name,
                    position=int(sec.position) if sec.position is not None else None,
                    latest_iteration=latest,
                )
            )

        return SessionOverviewOut(
            document_type_id=document_type_id,
            title=title,
            latest_global_instruction_text=gi_text,
            sections=out_sections,
        )