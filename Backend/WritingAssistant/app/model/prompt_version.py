from __future__ import annotations
from typing import Optional
import datetime

from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, Text, VARCHAR, text, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class PromptVersion(Base):
    __tablename__ = 'prompt_version'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_prompt_version_user'),
        ForeignKeyConstraint(['prompt_id'], ['prompt.id'], name='fk_prompt_version'),
        PrimaryKeyConstraint('id', name='sys_c008243')
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    prompt_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    created_by: Mapped[int] = mapped_column(BigInteger, nullable=False)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))
    description: Mapped[Optional[str]] = mapped_column(Text)
    prompt_text: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    num_executions:   Mapped[Optional[int]]   = mapped_column(BigInteger)
    avg_duration_ms:  Mapped[Optional[float]] = mapped_column(NUMBER(19, 2))
    avg_input_tokens: Mapped[Optional[float]] = mapped_column(NUMBER(19, 2))
    avg_output_tokens:Mapped[Optional[float]] = mapped_column(NUMBER(19, 2))
    avg_cost:         Mapped[Optional[float]] = mapped_column(NUMBER(19, 6))
    total_cost_usd:   Mapped[Optional[float]] = mapped_column(NUMBER(19, 6))
    error_rate:       Mapped[Optional[float]] = mapped_column(NUMBER(9, 6))
    failed_exec_count:Mapped[Optional[int]]   = mapped_column(BigInteger)  


    rating_count:     Mapped[Optional[int]]   = mapped_column(BigInteger)
    rating_avg:       Mapped[Optional[float]] = mapped_column(NUMBER(5, 2))
    rating_median:    Mapped[Optional[float]] = mapped_column(NUMBER(5, 2))
    rating_c1:        Mapped[Optional[int]]   = mapped_column(BigInteger)  
    rating_c2:        Mapped[Optional[int]]   = mapped_column(BigInteger)  
    rating_c3:        Mapped[Optional[int]]   = mapped_column(BigInteger)  
    rating_c4:        Mapped[Optional[int]]   = mapped_column(BigInteger)  
    rating_c5:        Mapped[Optional[int]]   = mapped_column(BigInteger)  


    stats_finalized_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(timezone=True))

    user: Mapped['User'] = relationship('User', back_populates='prompt_version')
    prompt: Mapped['Prompt'] = relationship('Prompt', back_populates='prompt_version')
    prompt_active_history: Mapped[list['PromptActiveHistory']] = relationship('PromptActiveHistory', back_populates='prompt_version')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='prompt_version')
