from __future__ import annotations

from sqlalchemy import PrimaryKeyConstraint, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Role(Base):
    __tablename__ = 'role'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008284'),
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))

    user_role: Mapped[list['UserRole']] = relationship('UserRole', back_populates='role')
