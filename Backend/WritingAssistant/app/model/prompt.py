from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Prompt(Base):
    __tablename__ = 'prompt'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_prompt_user'),
        ForeignKeyConstraint(['document_type_id'], ['document_type.id'], name='fk_prompt_doc_type'),
        PrimaryKeyConstraint('id', name='sys_c008238')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    title: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    document_type_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped['User'] = relationship('User', back_populates='prompt')
    document_type: Mapped['DocumentType'] = relationship('DocumentType', back_populates='prompt')
    prompt_version: Mapped[list['PromptVersion']] = relationship('PromptVersion', back_populates='prompt')
