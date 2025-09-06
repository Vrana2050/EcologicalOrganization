from __future__ import annotations
from typing import Optional
import datetime
import decimal

from sqlalchemy import Enum, ForeignKeyConstraint, PrimaryKeyConstraint, TIMESTAMP, Text, VARCHAR, text, BigInteger, Integer
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class PromptExecution(Base):
    __tablename__ = 'prompt_execution'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_exec_user'),
        ForeignKeyConstraint(['global_instruction_id'], ['global_instruction.id'], name='fk_exec_global_instr'),
        ForeignKeyConstraint(['pricing_id'], ['model_pricing.id'], name='fk_exec_pricing'),
        ForeignKeyConstraint(['prompt_version_id'], ['prompt_version.id'], name='fk_exec_prompt_ver'),
        ForeignKeyConstraint(['section_instruction_id'], ['section_instruction.id'], name='fk_exec_section_instr'),
        ForeignKeyConstraint(['session_id'], ['chat_session.id'], name='fk_exec_session'),
        PrimaryKeyConstraint('id', name='sys_c008270')
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    prompt_version_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    session_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(Enum('ok', 'failed'), nullable=False)
    created_by: Mapped[int] = mapped_column(BigInteger, nullable=False)
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))
    section_instruction_id: Mapped[Optional[int]] = mapped_column(BigInteger)
    global_instruction_id: Mapped[Optional[int]] = mapped_column(BigInteger)
    final_prompt: Mapped[Optional[str]] = mapped_column(Text)
    error_code: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    prompt_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    output_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    cost_usd: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 4, True))
    pricing_id: Mapped[Optional[int]] = mapped_column(BigInteger)
    started_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))
    finished_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer)

    user: Mapped['User'] = relationship('User', back_populates='prompt_execution')
    global_instruction: Mapped[Optional['GlobalInstruction']] = relationship('GlobalInstruction', back_populates='prompt_execution')
    pricing: Mapped[Optional['ModelPricing']] = relationship('ModelPricing', back_populates='prompt_execution')
    prompt_version: Mapped['PromptVersion'] = relationship('PromptVersion', back_populates='prompt_execution')
    section_instruction: Mapped[Optional['SectionInstruction']] = relationship('SectionInstruction', back_populates='prompt_execution')
    session: Mapped['ChatSession'] = relationship('ChatSession', back_populates='prompt_execution')
    model_output: Mapped[list['ModelOutput']] = relationship('ModelOutput', back_populates='prompt_execution')
