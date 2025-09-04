from __future__ import annotations
from typing import Optional

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class SectionIteration(Base):
    __tablename__ = 'section_iteration'
    __table_args__ = (
        ForeignKeyConstraint(['model_output_id'], ['model_output.id'], name='fk_iter_output'),
        ForeignKeyConstraint(['section_draft_id'], ['section_draft.id'], name='fk_iter_draft'),
        ForeignKeyConstraint(['section_instruction_id'], ['section_instruction.id'], name='fk_iter_instr'),
        ForeignKeyConstraint(['session_id'], ['chat_session.id'], name='fk_iter_session'),
        ForeignKeyConstraint(['session_section_id'], ['session_section.id'], name='fk_iter_section'),
        PrimaryKeyConstraint('id', name='sys_c008258')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    seq_no: Mapped[float] = mapped_column(NUMBER(10, 0, False), nullable=False)
    session_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    session_section_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    section_instruction_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    model_output_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    section_draft_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))

    model_output: Mapped[Optional['ModelOutput']] = relationship('ModelOutput', back_populates='section_iteration')
    section_draft: Mapped[Optional['SectionDraft']] = relationship('SectionDraft', back_populates='section_iteration')
    section_instruction: Mapped[Optional['SectionInstruction']] = relationship('SectionInstruction', back_populates='section_iteration')
    session: Mapped['ChatSession'] = relationship('ChatSession', back_populates='section_iteration')
    session_section: Mapped['SessionSection'] = relationship('SessionSection', back_populates='section_iteration')
