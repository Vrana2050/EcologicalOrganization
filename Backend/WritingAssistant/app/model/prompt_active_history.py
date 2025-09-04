from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class PromptActiveHistory(Base):
    __tablename__ = 'prompt_active_history'
    __table_args__ = (
        ForeignKeyConstraint(['activated_by'], ['user.id'], name='fk_prompt_history_user'),
        ForeignKeyConstraint(['prompt_version_id'], ['prompt_version.id'], name='fk_prompt_history'),
        PrimaryKeyConstraint('id', name='sys_c008246')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    prompt_version_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    activated_by: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    activated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    user: Mapped[Optional['User']] = relationship('User', back_populates='prompt_active_history')
    prompt_version: Mapped['PromptVersion'] = relationship('PromptVersion', back_populates='prompt_active_history')
