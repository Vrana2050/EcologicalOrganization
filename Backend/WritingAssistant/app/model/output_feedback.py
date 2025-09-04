from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import CheckConstraint, ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, Text, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class OutputFeedback(Base):
    __tablename__ = 'output_feedback'
    __table_args__ = (
        CheckConstraint('rating_value BETWEEN 1 AND 5', name='chk_rating_value'),
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_feedback_user'),
        ForeignKeyConstraint(['model_output_id'], ['model_output.id'], name='fk_feedback_output'),
        PrimaryKeyConstraint('id', name='sys_c008281')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), primary_key=True)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    model_output_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    rating_value: Mapped[Optional[float]] = mapped_column(NUMBER(1, 0, False))
    comment_text: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    user: Mapped['User'] = relationship('User', back_populates='output_feedback')
    model_output: Mapped[Optional['ModelOutput']] = relationship('ModelOutput', back_populates='output_feedback')
