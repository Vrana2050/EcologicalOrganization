from __future__ import annotations

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, text
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

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    role_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    user_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))

    role: Mapped['Role'] = relationship('Role', back_populates='user_role')
    user: Mapped['User'] = relationship('User', back_populates='user_role')
