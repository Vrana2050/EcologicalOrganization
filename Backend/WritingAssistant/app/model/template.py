from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, Text, VARCHAR, text, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Template(Base):
    __tablename__ = 'template'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_template_user'),
        ForeignKeyConstraint(['document_type_id'], ['document_type.id'], name='fk_template_doc_type'),
        ForeignKeyConstraint(['file_id'], ['template_file.id'], name='fk_template_file'),
        PrimaryKeyConstraint('id', name='sys_c008229')
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    document_type_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))
    file_id: Mapped[Optional[int]] = mapped_column(BigInteger)
    json_schema: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger)

    user: Mapped[Optional['User']] = relationship('User', back_populates='template')
    document_type: Mapped['DocumentType'] = relationship('DocumentType', back_populates='template')
    file: Mapped[Optional['TemplateFile']] = relationship('TemplateFile', back_populates='template')
    chat_session: Mapped[list['ChatSession']] = relationship('ChatSession', back_populates='template')
    template_section: Mapped[list['TemplateSection']] = relationship('TemplateSection', back_populates='template')
