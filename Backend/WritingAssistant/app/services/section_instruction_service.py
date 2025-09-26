from sqlalchemy.orm import Session
from app.repository.section_instruction_repository import SectionInstructionRepository
from app.repository.session_section_repository import SessionSectionRepository
from app.services.base_service import BaseService
from app.schema.section_instruction_schema import CreateSectionInstruction
from app.core.exceptions import NotFoundError, DuplicatedError


class SectionInstructionService(BaseService):
    def __init__(self, repository: SectionInstructionRepository, session_section_repository: SessionSectionRepository):
        self.section_instruction_repository = repository
        self.session_section_repository = session_section_repository
        super().__init__(repository)

    def add(self, schema: CreateSectionInstruction, user_id: int):
        session_section = self.session_section_repository.read_by_id(schema.session_section_id, eager=True)

        if session_section.session.created_by != user_id:
            raise NotFoundError(detail="You are not allowed to add instructions to this session")

        return self.section_instruction_repository.create(schema)
