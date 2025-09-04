from typing import Optional
import datetime
import decimal

from sqlalchemy import CheckConstraint, Enum, ForeignKeyConstraint, Identity, PrimaryKeyConstraint, TIMESTAMP, Text, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class DocumentType(Base):
    __tablename__ = 'document_type'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008225'),
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    prompt: Mapped[list['Prompt']] = relationship('Prompt', back_populates='document_type')
    template: Mapped[list['Template']] = relationship('Template', back_populates='document_type')


class ModelPricing(Base):
    __tablename__ = 'model_pricing'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008272'),
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    provider: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    model: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    prompt_token_usd: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 6, True))
    completion_token_usd: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 6, True))
    effective_from: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))
    effective_to: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='pricing')


class Role(Base):
    __tablename__ = 'role'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008284'),
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))

    user_role: Mapped[list['UserRole']] = relationship('UserRole', back_populates='role')


class TemplateFile(Base):
    __tablename__ = 'template_file'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008222'),
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    path: Mapped[str] = mapped_column(Text, nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    template: Mapped[list['Template']] = relationship('Template', back_populates='file')


class User(Base):
    __tablename__ = 'user'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_user_created'),
        PrimaryKeyConstraint('id', name='sys_c008288')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    email: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    password: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    first_name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    last_name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    created_by: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped[Optional['User']] = relationship('User', remote_side=[id], back_populates='user_reverse')
    user_reverse: Mapped[list['User']] = relationship('User', remote_side=[created_by], back_populates='user')
    prompt: Mapped[list['Prompt']] = relationship('Prompt', back_populates='user')
    template: Mapped[list['Template']] = relationship('Template', back_populates='user')
    user_role: Mapped[list['UserRole']] = relationship('UserRole', back_populates='user')
    chat_session: Mapped[list['ChatSession']] = relationship('ChatSession', back_populates='user')
    prompt_version: Mapped[list['PromptVersion']] = relationship('PromptVersion', back_populates='user')
    prompt_active_history: Mapped[list['PromptActiveHistory']] = relationship('PromptActiveHistory', back_populates='user')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='user')
    output_feedback: Mapped[list['OutputFeedback']] = relationship('OutputFeedback', back_populates='user')
    section_draft: Mapped[list['SectionDraft']] = relationship('SectionDraft', back_populates='user')


class Prompt(Base):
    __tablename__ = 'prompt'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_prompt_user'),
        ForeignKeyConstraint(['document_type_id'], ['document_type.id'], name='fk_prompt_doc_type'),
        PrimaryKeyConstraint('id', name='sys_c008238')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    title: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    document_type_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped['User'] = relationship('User', back_populates='prompt')
    document_type: Mapped['DocumentType'] = relationship('DocumentType', back_populates='prompt')
    prompt_version: Mapped[list['PromptVersion']] = relationship('PromptVersion', back_populates='prompt')


class Template(Base):
    __tablename__ = 'template'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_template_user'),
        ForeignKeyConstraint(['document_type_id'], ['document_type.id'], name='fk_template_doc_type'),
        ForeignKeyConstraint(['file_id'], ['template_file.id'], name='fk_template_file'),
        PrimaryKeyConstraint('id', name='sys_c008229')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    document_type_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    file_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    json_schema: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))
    created_by: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))

    user: Mapped[Optional['User']] = relationship('User', back_populates='template')
    document_type: Mapped['DocumentType'] = relationship('DocumentType', back_populates='template')
    file: Mapped[Optional['TemplateFile']] = relationship('TemplateFile', back_populates='template')
    chat_session: Mapped[list['ChatSession']] = relationship('ChatSession', back_populates='template')
    template_section: Mapped[list['TemplateSection']] = relationship('TemplateSection', back_populates='template')


class UserRole(Base):
    __tablename__ = 'user_role'
    __table_args__ = (
        ForeignKeyConstraint(['role_id'], ['role.id'], name='fk_user_role'),
        ForeignKeyConstraint(['user_id'], ['user.id'], name='fk_role_user'),
        PrimaryKeyConstraint('id', name='sys_c008292')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    role_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    user_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))

    role: Mapped['Role'] = relationship('Role', back_populates='user_role')
    user: Mapped['User'] = relationship('User', back_populates='user_role')


class ChatSession(Base):
    __tablename__ = 'chat_session'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_chat_session_user'),
        ForeignKeyConstraint(['template_id'], ['template.id'], name='fk_chat_session_template'),
        PrimaryKeyConstraint('id', name='sys_c008250')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    template_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    title: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped['User'] = relationship('User', back_populates='chat_session')
    template: Mapped['Template'] = relationship('Template', back_populates='chat_session')
    global_instruction: Mapped[list['GlobalInstruction']] = relationship('GlobalInstruction', back_populates='session')
    session_section: Mapped[list['SessionSection']] = relationship('SessionSection', back_populates='session')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='session')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='session')


class PromptVersion(Base):
    __tablename__ = 'prompt_version'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_prompt_version_user'),
        ForeignKeyConstraint(['prompt_id'], ['prompt.id'], name='fk_prompt_version'),
        PrimaryKeyConstraint('id', name='sys_c008243')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    prompt_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    description: Mapped[Optional[str]] = mapped_column(Text)
    prompt_text: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))

    user: Mapped['User'] = relationship('User', back_populates='prompt_version')
    prompt: Mapped['Prompt'] = relationship('Prompt', back_populates='prompt_version')
    prompt_active_history: Mapped[list['PromptActiveHistory']] = relationship('PromptActiveHistory', back_populates='prompt_version')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='prompt_version')


class TemplateSection(Base):
    __tablename__ = 'template_section'
    __table_args__ = (
        ForeignKeyConstraint(['template_id'], ['template.id'], name='fk_template_section'),
        PrimaryKeyConstraint('id', name='sys_c008233')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    template_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    position: Mapped[Optional[float]] = mapped_column(NUMBER(10, 0, False))

    template: Mapped['Template'] = relationship('Template', back_populates='template_section')
    session_section: Mapped[list['SessionSection']] = relationship('SessionSection', back_populates='template_section')


class GlobalInstruction(Base):
    __tablename__ = 'global_instruction'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['chat_session.id'], name='fk_global_instr'),
        PrimaryKeyConstraint('id', name='sys_c008261')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    session_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    text_: Mapped[Optional[str]] = mapped_column('text', Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    session: Mapped['ChatSession'] = relationship('ChatSession', back_populates='global_instruction')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='global_instruction')


class PromptActiveHistory(Base):
    __tablename__ = 'prompt_active_history'
    __table_args__ = (
        ForeignKeyConstraint(['activated_by'], ['user.id'], name='fk_prompt_history_user'),
        ForeignKeyConstraint(['prompt_version_id'], ['prompt_version.id'], name='fk_prompt_history'),
        PrimaryKeyConstraint('id', name='sys_c008246')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    prompt_version_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    activated_by: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    activated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    user: Mapped[Optional['User']] = relationship('User', back_populates='prompt_active_history')
    prompt_version: Mapped['PromptVersion'] = relationship('PromptVersion', back_populates='prompt_active_history')


class SessionSection(Base):
    __tablename__ = 'session_section'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['chat_session.id'], name='fk_session'),
        ForeignKeyConstraint(['template_section_id'], ['template_section.id'], name='fk_session_template_section'),
        PrimaryKeyConstraint('id', name='sys_c008253')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    session_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    template_section_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    position: Mapped[Optional[float]] = mapped_column(NUMBER(10, 0, False))

    session: Mapped['ChatSession'] = relationship('ChatSession', back_populates='session_section')
    template_section: Mapped[Optional['TemplateSection']] = relationship('TemplateSection', back_populates='session_section')
    section_instruction: Mapped[list['SectionInstruction']] = relationship('SectionInstruction', back_populates='session_section')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='session_section')


class SectionInstruction(Base):
    __tablename__ = 'section_instruction'
    __table_args__ = (
        ForeignKeyConstraint(['session_section_id'], ['session_section.id'], name='fk_section_instr'),
        PrimaryKeyConstraint('id', name='sys_c008264')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    session_section_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    text_: Mapped[Optional[str]] = mapped_column('text', Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    session_section: Mapped['SessionSection'] = relationship('SessionSection', back_populates='section_instruction')
    prompt_execution: Mapped[list['PromptExecution']] = relationship('PromptExecution', back_populates='section_instruction')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='section_instruction')


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

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    prompt_version_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    session_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    status: Mapped[str] = mapped_column(Enum('ok', 'failed'), nullable=False)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    section_instruction_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    global_instruction_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    final_prompt: Mapped[Optional[str]] = mapped_column(Text)
    error_code: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    prompt_tokens: Mapped[Optional[float]] = mapped_column(NUMBER(10, 0, False))
    output_tokens: Mapped[Optional[float]] = mapped_column(NUMBER(10, 0, False))
    cost_usd: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 4, True))
    pricing_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    started_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))
    finished_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True))
    duration_ms: Mapped[Optional[float]] = mapped_column(NUMBER(10, 0, False))

    user: Mapped['User'] = relationship('User', back_populates='prompt_execution')
    global_instruction: Mapped[Optional['GlobalInstruction']] = relationship('GlobalInstruction', back_populates='prompt_execution')
    pricing: Mapped[Optional['ModelPricing']] = relationship('ModelPricing', back_populates='prompt_execution')
    prompt_version: Mapped['PromptVersion'] = relationship('PromptVersion', back_populates='prompt_execution')
    section_instruction: Mapped[Optional['SectionInstruction']] = relationship('SectionInstruction', back_populates='prompt_execution')
    session: Mapped['ChatSession'] = relationship('ChatSession', back_populates='prompt_execution')
    model_output: Mapped[list['ModelOutput']] = relationship('ModelOutput', back_populates='prompt_execution')


class ModelOutput(Base):
    __tablename__ = 'model_output'
    __table_args__ = (
        ForeignKeyConstraint(['prompt_execution_id'], ['prompt_execution.id'], name='fk_output_exec'),
        PrimaryKeyConstraint('id', name='sys_c008275')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    prompt_execution_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    generated_text: Mapped[Optional[str]] = mapped_column(Text)

    prompt_execution: Mapped['PromptExecution'] = relationship('PromptExecution', back_populates='model_output')
    output_feedback: Mapped[list['OutputFeedback']] = relationship('OutputFeedback', back_populates='model_output')
    section_draft: Mapped[list['SectionDraft']] = relationship('SectionDraft', back_populates='model_output_')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='model_output')


class OutputFeedback(Base):
    __tablename__ = 'output_feedback'
    __table_args__ = (
        CheckConstraint('rating_value BETWEEN 1 AND 5', name='chk_rating_value'),
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_feedback_user'),
        ForeignKeyConstraint(['model_output_id'], ['model_output.id'], name='fk_feedback_output'),
        PrimaryKeyConstraint('id', name='sys_c008281')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    model_output_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    rating_value: Mapped[Optional[float]] = mapped_column(NUMBER(1, 0, False))
    comment_text: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    user: Mapped['User'] = relationship('User', back_populates='output_feedback')
    model_output: Mapped[Optional['ModelOutput']] = relationship('ModelOutput', back_populates='output_feedback')


class SectionDraft(Base):
    __tablename__ = 'section_draft'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['user.id'], name='fk_draft_user'),
        ForeignKeyConstraint(['model_output'], ['model_output.id'], name='fk_draft_output'),
        PrimaryKeyConstraint('id', name='sys_c008278')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    created_by: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    model_output: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    content: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(True), server_default=text('CURRENT_TIMESTAMP\n'))

    user: Mapped['User'] = relationship('User', back_populates='section_draft')
    model_output_: Mapped[Optional['ModelOutput']] = relationship('ModelOutput', back_populates='section_draft')
    section_iteration: Mapped[list['SectionIteration']] = relationship('SectionIteration', back_populates='section_draft')


class SectionIteration(Base):
    __tablename__ = 'section_iteration'
    __table_args__ = (
        ForeignKeyConstraint(['model_output_id'], ['model_output.id'], name='fk_iter_output'),
        ForeignKeyConstraint(['section_draft_id'], ['section_draft.id'], name='fk_iter_draft'),
        ForeignKeyConstraint(['section_instruction_id'], ['section_instruction.id'], name='fk_iter_instr'),
        ForeignKeyConstraint(['session_id'], ['chat_session.id'], name='fk_iter_session'),
        ForeignKeyConstraint(['session_section_id'], ['session_section.id'], name='fk_iter_section'),
        PrimaryKeyConstraint('id', name='sys_c008258')
    )

    id: Mapped[float] = mapped_column(NUMBER(asdecimal=False), Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    seq_no: Mapped[float] = mapped_column(NUMBER(10, 0, False), nullable=False)
    session_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    session_section_id: Mapped[float] = mapped_column(NUMBER(19, 0, False), nullable=False)
    deleted: Mapped[float] = mapped_column(NUMBER(1, 0, False), nullable=False, server_default=text('0 '))
    section_instruction_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    model_output_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))
    section_draft_id: Mapped[Optional[float]] = mapped_column(NUMBER(19, 0, False))

    model_output: Mapped[Optional['ModelOutput']] = relationship('ModelOutput', back_populates='section_iteration')
    section_draft: Mapped[Optional['SectionDraft']] = relationship('SectionDraft', back_populates='section_iteration')
    section_instruction: Mapped[Optional['SectionInstruction']] = relationship('SectionInstruction', back_populates='section_iteration')
    session: Mapped['ChatSession'] = relationship('ChatSession', back_populates='section_iteration')
    session_section: Mapped['SessionSection'] = relationship('SessionSection', back_populates='section_iteration')
