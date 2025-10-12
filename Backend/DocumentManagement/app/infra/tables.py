from typing import Optional
import datetime

from sqlalchemy import Boolean, CheckConstraint, Enum, ForeignKeyConstraint, Identity, Index, Integer, PrimaryKeyConstraint, TIMESTAMP, VARCHAR, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class AuditLogs(Base):
    __tablename__ = 'audit_logs'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008409'),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    user_email: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    object_type: Mapped[str] = mapped_column(Enum('FOLDER', 'FILE', 'TAG', 'METADATA', 'GROUP'), nullable=False)
    object_name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    action: Mapped[str] = mapped_column(VARCHAR(500), nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(Integer)
    object_id: Mapped[Optional[int]] = mapped_column(Integer)


class CustomMetadatas(Base):
    __tablename__ = 'custom_metadatas'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008498'),
        Index('sys_c008499', 'name', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    metadata_type: Mapped[str] = mapped_column(Enum('String', 'Boolean', 'Date', 'Datetime', 'Time', 'Integer', 'Decimal'), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(VARCHAR(500))

    custom_metadata_rules: Mapped[list['CustomMetadataRules']] = relationship('CustomMetadataRules', back_populates='custom_metadata')
    custom_metadata_values: Mapped[list['CustomMetadataValues']] = relationship('CustomMetadataValues', back_populates='custom_metadata', passive_deletes=True)


class PermissionValues(Base):
    __tablename__ = 'permission_values'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008480'),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    access_type: Mapped[str] = mapped_column(Enum('EDITOR', 'VIEWER', 'PREVIEW'), nullable=False)
    expires_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP)

    permissions: Mapped[list['Permissions']] = relationship('Permissions', back_populates='permission_value')


class Retentions(Base):
    __tablename__ = 'retentions'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008418'),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    expiration_action: Mapped[str] = mapped_column(Enum('DELETE', 'RECYCLE_BIN', 'ARCHIVE'), nullable=False)
    retention_days: Mapped[int] = mapped_column(Integer, nullable=False)
    retention_weeks: Mapped[int] = mapped_column(Integer, nullable=False)
    retention_months: Mapped[int] = mapped_column(Integer, nullable=False)
    retention_years: Mapped[int] = mapped_column(Integer, nullable=False)
    is_applied_to_subfolders: Mapped[Optional[bool]] = mapped_column(Boolean, server_default=text('0 '))

    directories: Mapped[list['Directories']] = relationship('Directories', back_populates='retention')
    documents: Mapped[list['Documents']] = relationship('Documents', back_populates='retention')


class Tags(Base):
    __tablename__ = 'tags'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008421'),
        Index('sys_c008422', 'name', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(VARCHAR(500))

    tag_assignments: Mapped[list['TagAssignments']] = relationship('TagAssignments', back_populates='tag', passive_deletes=True)


class UserGroups(Base):
    __tablename__ = 'user_groups'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='sys_c008471'),
        Index('sys_c008472', 'name', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(VARCHAR(500))

    group_members: Mapped[list['GroupMembers']] = relationship('GroupMembers', back_populates='group')
    permissions: Mapped[list['Permissions']] = relationship('Permissions', back_populates='group', passive_deletes=True)


class Directories(Base):
    __tablename__ = 'directories'
    __table_args__ = (
        ForeignKeyConstraint(['parent_directory_id'], ['directories.id'], ondelete='CASCADE', name='fk_parent_directory'),
        ForeignKeyConstraint(['retention_id'], ['retentions.id'], name='fk_retention'),
        PrimaryKeyConstraint('id', name='sys_c008432')
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)
    creator_id: Mapped[int] = mapped_column(Integer, nullable=False)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)
    retention_type: Mapped[str] = mapped_column(Enum('INHERITED', 'ACTIVE', 'INACTIVE'), nullable=False)
    directory_type: Mapped[str] = mapped_column(Enum('SYSTEM', 'REGULAR'), nullable=False)
    parent_directory_id: Mapped[Optional[int]] = mapped_column(Integer)
    retention_id: Mapped[Optional[int]] = mapped_column(Integer)

    parent_directory: Mapped[Optional['Directories']] = relationship('Directories', remote_side=[id], back_populates='parent_directory_reverse')
    parent_directory_reverse: Mapped[list['Directories']] = relationship('Directories', remote_side=[parent_directory_id], back_populates='parent_directory', passive_deletes=True)
    retention: Mapped[Optional['Retentions']] = relationship('Retentions', back_populates='directories')
    custom_metadata_rules: Mapped[list['CustomMetadataRules']] = relationship('CustomMetadataRules', back_populates='directory')
    documents: Mapped[list['Documents']] = relationship('Documents', back_populates='parent_directory', passive_deletes=True)
    custom_metadata_values: Mapped[list['CustomMetadataValues']] = relationship('CustomMetadataValues', back_populates='directory', passive_deletes=True)
    permissions: Mapped[list['Permissions']] = relationship('Permissions', back_populates='directory', passive_deletes=True)
    tag_assignments: Mapped[list['TagAssignments']] = relationship('TagAssignments', back_populates='directory', passive_deletes=True)


class GroupMembers(Base):
    __tablename__ = 'group_members'
    __table_args__ = (
        ForeignKeyConstraint(['group_id'], ['user_groups.id'], ondelete='CASCADE', name='fk_group_member_group'),
        PrimaryKeyConstraint('user_id', 'group_id', name='pk_group_member')
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    group_id: Mapped[int] = mapped_column(Integer, primary_key=True)

    group: Mapped['UserGroups'] = relationship('UserGroups', back_populates='group_members')


class CustomMetadataRules(Base):
    __tablename__ = 'custom_metadata_rules'
    __table_args__ = (
        ForeignKeyConstraint(['custom_metadata_id'], ['custom_metadatas.id'], ondelete='CASCADE', name='fk_custom_metadata_rule_metadata'),
        ForeignKeyConstraint(['directory_id'], ['directories.id'], ondelete='CASCADE', name='fk_custom_metadata_rule_directory'),
        PrimaryKeyConstraint('id', name='sys_c008507'),
        Index('uk_custom_metadata_rule', 'custom_metadata_id', 'directory_id', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    custom_metadata_id: Mapped[int] = mapped_column(Integer, nullable=False)
    directory_id: Mapped[int] = mapped_column(Integer, nullable=False)
    applies_to: Mapped[str] = mapped_column(Enum('DIRECTORY', 'DOCUMENT', 'BOTH'), nullable=False)
    is_required: Mapped[Optional[bool]] = mapped_column(Boolean, server_default=text('0 '))
    is_recursive: Mapped[Optional[bool]] = mapped_column(Boolean, server_default=text('0 '))

    custom_metadata: Mapped['CustomMetadatas'] = relationship('CustomMetadatas', back_populates='custom_metadata_rules')
    directory: Mapped['Directories'] = relationship('Directories', back_populates='custom_metadata_rules')
    custom_metadata_values: Mapped[list['CustomMetadataValues']] = relationship('CustomMetadataValues', back_populates='metadata_rule')


class Documents(Base):
    __tablename__ = 'documents'
    __table_args__ = (
        ForeignKeyConstraint(['parent_directory_id'], ['directories.id'], ondelete='CASCADE', name='fk_document_parent_directory'),
        ForeignKeyConstraint(['retention_id'], ['retentions.id'], name='fk_document_retention'),
        PrimaryKeyConstraint('id', name='sys_c008446')
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)
    creator_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)
    parent_directory_id: Mapped[int] = mapped_column(Integer, nullable=False)
    active_version: Mapped[int] = mapped_column(Integer, nullable=False)
    retention_type: Mapped[str] = mapped_column(Enum('INHERITED', 'ACTIVE', 'INACTIVE'), nullable=False)
    status: Mapped[str] = mapped_column(Enum('ACTIVE', 'ARCHIVED', 'RECYCLED'), nullable=False)
    retention_id: Mapped[Optional[int]] = mapped_column(Integer)
    retention_expires: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP)

    parent_directory: Mapped['Directories'] = relationship('Directories', back_populates='documents')
    retention: Mapped[Optional['Retentions']] = relationship('Retentions', back_populates='documents')
    custom_metadata_values: Mapped[list['CustomMetadataValues']] = relationship('CustomMetadataValues', back_populates='document',  passive_deletes=True)
    document_files: Mapped[list['DocumentFiles']] = relationship('DocumentFiles', back_populates='document',  passive_deletes=True)
    permissions: Mapped[list['Permissions']] = relationship('Permissions', back_populates='document',  passive_deletes=True)
    tag_assignments: Mapped[list['TagAssignments']] = relationship('TagAssignments', back_populates='document',  passive_deletes=True)


class CustomMetadataValues(Base):
    __tablename__ = 'custom_metadata_values'
    __table_args__ = (
        CheckConstraint('\n        (custom_metadata_id IS NULL AND metadata_rule_id IS NOT NULL) OR\n        (custom_metadata_id IS NOT NULL AND metadata_rule_id IS NULL)\n    ', name='chk_custom_metadata_value_rule_reference'),
        CheckConstraint('\n        (custom_metadata_id IS NULL AND metadata_rule_id IS NOT NULL) OR\n        (custom_metadata_id IS NOT NULL AND metadata_rule_id IS NULL)\n    ', name='chk_custom_metadata_value_rule_reference'),
        CheckConstraint('\n        (document_id IS NULL AND directory_id IS NOT NULL) OR\n        (document_id IS NOT NULL AND directory_id IS NULL)\n    ', name='chk_custom_metadata_value_resource_reference'),
        CheckConstraint('\n        (document_id IS NULL AND directory_id IS NOT NULL) OR\n        (document_id IS NOT NULL AND directory_id IS NULL)\n    ', name='chk_custom_metadata_value_resource_reference'),
        ForeignKeyConstraint(['custom_metadata_id'], ['custom_metadatas.id'], ondelete='CASCADE', name='fk_custom_metadata_value_metadata'),
        ForeignKeyConstraint(['directory_id'], ['directories.id'], ondelete='CASCADE', name='fk_custom_metadata_value_directory'),
        ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE', name='fk_custom_metadata_value_document'),
        ForeignKeyConstraint(['metadata_rule_id'], ['custom_metadata_rules.id'], ondelete='CASCADE', name='fk_custom_metadata_value_rule'),
        PrimaryKeyConstraint('id', name='sys_c008515'),
        Index('uk_custom_metadata_value_directory', 'custom_metadata_id', 'directory_id', unique=True),
        Index('uk_custom_metadata_value_document', 'custom_metadata_id', 'document_id', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    custom_metadata_id: Mapped[Optional[int]] = mapped_column(Integer)
    document_id: Mapped[Optional[int]] = mapped_column(Integer)
    directory_id: Mapped[Optional[int]] = mapped_column(Integer)
    metadata_rule_id: Mapped[Optional[int]] = mapped_column(Integer)
    value: Mapped[Optional[str]] = mapped_column(VARCHAR(1000))
    is_missing_value: Mapped[Optional[bool]] = mapped_column(Boolean, server_default=text('0 '))

    custom_metadata: Mapped[Optional['CustomMetadatas']] = relationship('CustomMetadatas', back_populates='custom_metadata_values')
    directory: Mapped[Optional['Directories']] = relationship('Directories', back_populates='custom_metadata_values')
    document: Mapped[Optional['Documents']] = relationship('Documents', back_populates='custom_metadata_values')
    metadata_rule: Mapped[Optional['CustomMetadataRules']] = relationship('CustomMetadataRules', back_populates='custom_metadata_values')


class DocumentFiles(Base):
    __tablename__ = 'document_files'
    __table_args__ = (
        ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE', name='fk_document_file_document'),
        PrimaryKeyConstraint('document_id', 'version', name='sys_c008457'),
        Index('sys_c008458', 'physical_path', unique=True)
    )

    document_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True)
    uploaded_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)
    uploader_id: Mapped[int] = mapped_column(Integer, nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    file_type: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    physical_path: Mapped[str] = mapped_column(VARCHAR(500), nullable=False)
    file_name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(VARCHAR(2000))

    document: Mapped['Documents'] = relationship('Documents', back_populates='document_files')


class Permissions(Base):
    __tablename__ = 'permissions'
    __table_args__ = (
        CheckConstraint('\n        (directory_id IS NOT NULL AND document_id IS NULL) OR\n        (directory_id IS NULL AND document_id IS NOT NULL)\n    ', name='chk_permission_target'),
        CheckConstraint('\n        (directory_id IS NOT NULL AND document_id IS NULL) OR\n        (directory_id IS NULL AND document_id IS NOT NULL)\n    ', name='chk_permission_target'),
        ForeignKeyConstraint(['directory_id'], ['directories.id'], ondelete='CASCADE', name='fk_permission_directory'),
        ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE', name='fk_permission_document'),
        ForeignKeyConstraint(['group_id'], ['user_groups.id'], ondelete='CASCADE', name='fk_permission_group'),
        ForeignKeyConstraint(['permission_value_id'], ['permission_values.id'], name='fk_permission_permission_value'),
        PrimaryKeyConstraint('id', name='sys_c008488'),
        Index('uk_permission_unique', 'user_id', 'directory_id', 'document_id', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    access_origin: Mapped[str] = mapped_column(Enum('INHERITED', 'DIRECT'), nullable=False)
    principal_type: Mapped[str] = mapped_column(Enum('OWNER', 'MANAGER', 'EMPLOYEE', 'GROUP'), nullable=False)
    permission_value_id: Mapped[int] = mapped_column(Integer, nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(Integer)
    group_id: Mapped[Optional[int]] = mapped_column(Integer)
    directory_id: Mapped[Optional[int]] = mapped_column(Integer)
    document_id: Mapped[Optional[int]] = mapped_column(Integer)
    parent_directory_id: Mapped[Optional[int]] = mapped_column(Integer)

    directory: Mapped[Optional['Directories']] = relationship('Directories', back_populates='permissions')
    document: Mapped[Optional['Documents']] = relationship('Documents', back_populates='permissions')
    group: Mapped[Optional['UserGroups']] = relationship('UserGroups', back_populates='permissions')
    permission_value: Mapped['PermissionValues'] = relationship('PermissionValues', back_populates='permissions')


class TagAssignments(Base):
    __tablename__ = 'tag_assignments'
    __table_args__ = (
        CheckConstraint('\n        (document_id IS NULL AND directory_id IS NOT NULL) OR\n        (document_id IS NOT NULL AND directory_id IS NULL)\n    ', name='chk_tag_assignment_reference'),
        CheckConstraint('\n        (document_id IS NULL AND directory_id IS NOT NULL) OR\n        (document_id IS NOT NULL AND directory_id IS NULL)\n    ', name='chk_tag_assignment_reference'),
        ForeignKeyConstraint(['directory_id'], ['directories.id'], ondelete='CASCADE', name='fk_tag_assignment_directory'),
        ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE', name='fk_tag_assignment_document'),
        ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE', name='fk_tag_assignment_tag'),
        PrimaryKeyConstraint('id', name='sys_c008463'),
        Index('uk_tag_assignment_directory', 'tag_id', 'directory_id', unique=True),
        Index('uk_tag_assignment_document', 'tag_id', 'document_id', unique=True)
    )

    id: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    tag_id: Mapped[int] = mapped_column(Integer, nullable=False)
    document_id: Mapped[Optional[int]] = mapped_column(Integer)
    directory_id: Mapped[Optional[int]] = mapped_column(Integer)

    directory: Mapped[Optional['Directories']] = relationship('Directories', back_populates='tag_assignments')
    document: Mapped[Optional['Documents']] = relationship('Documents', back_populates='tag_assignments')
    tag: Mapped['Tags'] = relationship('Tags', back_populates='tag_assignments', passive_deletes=True)
