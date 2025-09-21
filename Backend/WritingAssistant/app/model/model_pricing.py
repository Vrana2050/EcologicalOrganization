from __future__ import annotations
from typing import Optional
import datetime
import decimal

from sqlalchemy import PrimaryKeyConstraint, TIMESTAMP, VARCHAR, text, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class ModelPricing(Base):
    __tablename__ = 'model_pricing'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008272'),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))
    provider: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    model: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    prompt_token_usd: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(19, 8, True))
    completion_token_usd: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(19, 8, True))
    effective_from: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(timezone=False))
    effective_to:   Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(timezone=False))

    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='pricing')
