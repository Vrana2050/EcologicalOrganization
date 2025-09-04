from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import PrimaryKeyConstraint, TIMESTAMP, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class DocumentType(Base):
    __tablename__ = 'document_type'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008225'),
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    prompt: Mapped[list['Prompt']] = relationship('Prompt', back_populates='document_type')
    template: Mapped[list['Template']] = relationship('Template', back_populates='document_type')
