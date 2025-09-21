import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, String, UniqueConstraint, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Users(Base):
    __tablename__ = 'users'
    __table_args__ = (
        CheckConstraint('is_active = ANY (ARRAY[true, false])', name='chk_users_is_active'),
        PrimaryKeyConstraint('id', name='users_pkey'),
        UniqueConstraint('email', name='users_email_key')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    since: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('true'))

    user_roles: Mapped[list['UserRoles']] = relationship('UserRoles', back_populates='user')


class UserRoles(Base):
    __tablename__ = 'user_roles'
    __table_args__ = (
        CheckConstraint("role::text = ANY (ARRAY['MANAGER'::character varying, 'EMPLOYEE'::character varying, 'ADMIN'::character varying]::text[])", name='chk_user_roles_role'),
        CheckConstraint("subsystem::text = ANY (ARRAY['DM'::character varying, 'DP'::character varying, 'PM'::character varying, 'WA'::character varying]::text[])", name='chk_user_roles_subsystem'),
        ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_user_roles_user'),
        PrimaryKeyConstraint('user_id', 'subsystem', name='pk_user_roles')
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    subsystem: Mapped[str] = mapped_column(String(10), primary_key=True)

    user: Mapped['Users'] = relationship('Users', back_populates='user_roles')
