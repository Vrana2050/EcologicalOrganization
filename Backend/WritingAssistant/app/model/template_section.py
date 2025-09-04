from __future__ import annotations
from typing import Optional

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class TemplateSection(Base):
    __tablename__ = 'template_section'
    __table_args__ = (
        ForeignKeyConstraint(['template_id'], ['template.id'], name='fk_template_section'),
        PrimaryKeyConstraint('id', name='sys_c008233')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    template_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    position: Mapped[Optional[float]] = mapped_column(NUMBER(10, 0, False))

    template: Mapped['Template'] = relationship('Template', back_populates='template_section')
    session_section: Mapped[list['SessionSection']] = relationship('SessionSection', back_populates='template_section')
