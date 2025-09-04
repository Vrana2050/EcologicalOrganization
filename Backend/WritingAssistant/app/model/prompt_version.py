from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, Text, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class PromptVersion(Base):
    __tablename__ = 'prompt_version'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_prompt_version_user'),
        ForeignKeyConstraint(['prompt_id'], ['prompt.id'], name='fk_prompt_version'),
        PrimaryKeyConstraint('id', name='sys_c008243')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    prompt_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    description: Mapped[Optional[str]] = mapped_column(Text)
    prompt_text: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped['User'] = relationship('User', back_populates='prompt_version')
    prompt: Mapped['Prompt'] = relationship('Prompt', back_populates='prompt_version')
    prompt_active_history: Mapped[list['PromptActiveHistory']] = relationship('PromptActiveHistory', back_populates='prompt_version')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='prompt_version')
