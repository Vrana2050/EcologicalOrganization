from __future__ import annotations

from sqlalchemy import PrimaryKeyConstraint, VARCHAR, text, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Role(Base):
    __tablename__ = 'role'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008284'),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))

    user_role: Mapped[list['UserRole']] = relationship('UserRole', back_populates='role')
