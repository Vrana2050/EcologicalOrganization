from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import PrimaryKeyConstraint, TIMESTAMP, Text, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class TemplateFile(Base):
    __tablename__ = 'template_file'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008222'),
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    path: Mapped[str] = mapped_column(Text, nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    template: Mapped[list['Template']] = relationship('Template', back_populates='file')
