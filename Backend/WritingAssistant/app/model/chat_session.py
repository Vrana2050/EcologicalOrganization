from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, VARCHAR, text, Identity, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class ChatSession(Base):
    __tablename__ = 'chat_session'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_chat_session_user'),
        ForeignKeyConstraint(['template_id'], ['template.id'], name='fk_chat_session_template'),
        PrimaryKeyConstraint('id', name='sys_c008250')
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(always=False), primary_key=True)
    template_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_by: Mapped[int] = mapped_column(BigInteger, nullable=False)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))
    title: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped['User'] = relationship('User', back_populates='chat_session')
    template: Mapped['Template'] = relationship('Template', back_populates='chat_session')
    global_instruction: Mapped[list['GlobalInstruction']] = relationship('GlobalInstruction', back_populates='session')
    session_section: Mapped[list['SessionSection']] = relationship('SessionSection', back_populates='session')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='session')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='session')
