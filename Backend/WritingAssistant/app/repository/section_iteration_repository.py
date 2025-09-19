from contextlib import AbstractContextManager
from typing import Callable, Optional
from sqlalchemy.orm import Session, joinedload
from app.repository.base_repository import BaseRepository
from app.model.section_iteration import SectionIteration
from sqlalchemy import func

class SectionIterationRepository(BaseRepository):
    DEFAULT_ORDERING = "-seq_no"

    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, SectionIteration)

    def by_section_and_seq(self, section_id: int, seq_no: int) -> Optional[SectionIteration]:
        with self.session_factory() as s:
            it = (
                s.query(SectionIteration)
                .filter(
                    SectionIteration.session_section_id == section_id,
                    SectionIteration.seq_no == seq_no,
                    SectionIteration.deleted == 0,
                )
                .options(
                    joinedload(SectionIteration.section_instruction),
                    joinedload(SectionIteration.model_output),
                    joinedload(SectionIteration.section_draft),
                )
                .first()
            )
            if it:
                s.refresh(it)      
                s.expunge(it)      
            return it

    def next_seq_for_section(self, section_id: int) -> int:
        with self.session_factory() as s:
            mx = s.query(func.max(SectionIteration.seq_no)).filter(
                SectionIteration.session_section_id == section_id
            ).scalar()
            return int(mx or 0) + 1    
