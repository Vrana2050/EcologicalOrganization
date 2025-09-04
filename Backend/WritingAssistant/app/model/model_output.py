from __future__ import annotations
from typing import Optional

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, Text, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class ModelOutput(Base):
    __tablename__ = 'model_output'
    __table_args__ = (
        ForeignKeyConstraint(['prompt_execution_id'], ['prompt_execution.id'], name='fk_output_exec'),
        PrimaryKeyConstraint('id', name='sys_c008275')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    prompt_execution_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    generated_text: Mapped[Optional[str]] = mapped_column(Text)

    prompt_execution: Mapped['PromptExecution'] = relationship('PromptExecution', back_populates='model_output')
    output_feedback: Mapped[list['OutputFeedback']] = relationship('OutputFeedback', back_populates='model_output')
    section_draft: Mapped[list['SectionDraft']] = relationship('SectionDraft', back_populates='model_output_')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='model_output')
