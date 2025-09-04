from __future__ import annotations
from typing import Optional

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class SessionSection(Base):
    __tablename__ = 'session_section'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['chat_session.id'], name='fk_session'),
        ForeignKeyConstraint(['template_section_id'], ['template_section.id'], name='fk_session_template_section'),
        PrimaryKeyConstraint('id', name='sys_c008253')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    session_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    template_section_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    position: Mapped[Optional[float]] = mapped_column(NUMBER(10, 0, False))

    session: Mapped['ChatSession'] = relationship('ChatSession', back_populates='session_section')
    template_section: Mapped[Optional['TemplateSection']] = relationship('TemplateSection', back_populates='session_section')
    section_instruction: Mapped[list['SectionInstruction']] = relationship('SectionInstruction', back_populates='session_section')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='session_section')
