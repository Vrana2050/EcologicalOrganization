from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, VARCHAR, text, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class User(Base):
    __tablename__ = 'user'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_user_created'),
        PrimaryKeyConstraint('id', name='sys_c008288')
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    password: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))
    first_name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    last_name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped[Optional['User']] = relationship('User', remote_side=[id], back_populates='user_reverse')
    user_reverse: Mapped[list['User']] = relationship('User', remote_side=[created_by], back_populates='user')
    prompt: Mapped[list['Prompt']] = relationship('Prompt', back_populates='user')
    template: Mapped[list['Template']] = relationship('Template', back_populates='user')
    user_role: Mapped[list['UserRole']] = relationship('UserRole', back_populates='user')
    chat_session: Mapped[list['ChatSession']] = relationship('ChatSession', back_populates='user')
    prompt_version: Mapped[list['PromptVersion']] = relationship('PromptVersion', back_populates='user')
    prompt_active_history: Mapped[list['PromptActiveHistory']] = relationship('PromptActiveHistory', back_populates='user')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='user')
    output_feedback: Mapped[list['OutputFeedback']] = relationship('OutputFeedback', back_populates='user')
    section_draft: Mapped[list['SectionDraft']] = relationship('SectionDraft', back_populates='user')
