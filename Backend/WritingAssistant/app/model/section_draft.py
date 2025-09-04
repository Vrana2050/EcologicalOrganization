from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, Text, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class SectionDraft(Base):
    __tablename__ = 'section_draft'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_draft_user'),
        ForeignKeyConstraint(['model_output'], ['model_output.id'], name='fk_draft_output'),
        PrimaryKeyConstraint('id', name='sys_c008278')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    model_output: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    content: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    user: Mapped['User'] = relationship('User', back_populates='section_draft')
    model_output_: Mapped[Optional['ModelOutput']] = relationship('ModelOutput', back_populates='section_draft')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='section_draft')
