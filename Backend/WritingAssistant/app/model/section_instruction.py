from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, Text, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class SectionInstruction(Base):
    __tablename__ = 'section_instruction'
    __table_args__ = (
        ForeignKeyConstraint(['session_section_id'], ['session_section.id'], name='fk_section_instr'),
        PrimaryKeyConstraint('id', name='sys_c008264')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    session_section_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    text_: Mapped[Optional[str]] = mapped_column('text', Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    session_section: Mapped['SessionSection'] = relationship('SessionSection', back_populates='section_instruction')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='section_instruction')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='section_instruction')
