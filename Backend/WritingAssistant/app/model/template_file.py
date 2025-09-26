from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import PrimaryKeyConstraint, TIMESTAMP, Text, text, BigInteger, Integer, VARCHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class TemplateFile(Base):
    __tablename__ = 'template_file'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008222'),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    path: Mapped[str] = mapped_column(Text, nullable=False)
    original_name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    mime_type: Mapped[Optional[str]] = mapped_column(VARCHAR(100))
    size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0 "))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        TIMESTAMP(True), server_default=text("CURRENT_TIMESTAMP")
    )

    template: Mapped[list['Template']] = relationship('Template', back_populates='file')
