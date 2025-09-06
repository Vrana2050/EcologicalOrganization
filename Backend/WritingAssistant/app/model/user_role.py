from __future__ import annotations

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, text, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class UserRole(Base):
    __tablename__ = 'user_role'
    __table_args__ = (
        ForeignKeyConstraint(['role_id'], ['role.id'], name='fk_user_role'),
        ForeignKeyConstraint(['user_id'], ['user.id'], name='fk_role_user'),
        PrimaryKeyConstraint('id', name='sys_c008292')
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    role_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))

    role: Mapped['Role'] = relationship('Role', back_populates='user_role')
    user: Mapped['User'] = relationship('User', back_populates='user_role')
