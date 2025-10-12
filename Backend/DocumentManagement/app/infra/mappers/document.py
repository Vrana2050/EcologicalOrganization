from app.domain.document import DocumentStatus, RetentionType, Document, DocumentFile
from app.infra.mappers.metadata import custom_metadata_value_from_db
from app.infra.mappers.permissions import permission_from_db
from app.infra.mappers.tags import tag_db_to_domain
from app.infra.tables import Documents, DocumentFiles

def document_from_db(db_document: Documents) -> Document:
    return Document(
        id=db_document.id,
        created_at=db_document.created_at,
        creator_id=db_document.creator_id,
        name=db_document.name,
        last_modified=db_document.last_modified,
        parent_directory_id=db_document.parent_directory_id,
        active_version=db_document.active_version,
        retention_type=RetentionType(db_document.retention_type),
        status=DocumentStatus(db_document.status),
        retention_id=db_document.retention_id,
        retention_expires=db_document.retention_expires,
        document_files=[document_file_from_db(f) for f in db_document.document_files],
        permissions=[permission_from_db(p) for p in db_document.permissions],
        custom_metadata_values=[custom_metadata_value_from_db(mv) for mv in db_document.custom_metadata_values],
        tags=[tag_db_to_domain(ta.tag) for ta in db_document.tag_assignments]
    )

#
# def document_from_db(db_document: Documents) -> Document:
#     return Document(
#         id=db_document.id,
#         created_at=db_document.created_at,
#         creator_id=db_document.creator_id,
#         name=db_document.name,
#         last_modified=db_document.last_modified,
#         parent_directory_id=db_document.parent_directory_id,
#         active_version=db_document.active_version,
#         retention_type=RetentionType(db_document.retention_type),
#         status=DocumentStatus(db_document.status),
#         retention_id=db_document.retention_id,
#         retention_expires=db_document.retention_expires,
#         document_files=[document_file_from_db(f) for f in db_document.document_files],
#         permissions=[permission_from_db(p) for p in db_document.permissions]
#     )

def document_file_from_db(db_file: DocumentFiles) -> DocumentFile:
    return DocumentFile(
        document_id=db_file.document_id,
        version=db_file.version,
        uploaded_at=db_file.uploaded_at,
        uploader_id=db_file.uploader_id,
        file_size=db_file.file_size,
        file_type=db_file.file_type,
        physical_path=db_file.physical_path,
        file_name=db_file.file_name,
        summary=db_file.summary
    )

def document_to_db(document: Document) -> Documents:
    return Documents(
        id=document.id,
        created_at=document.created_at,
        creator_id=document.creator_id,
        name=document.name,
        last_modified=document.last_modified,
        parent_directory_id=document.parent_directory_id,
        active_version=document.active_version,
        retention_type=document.retention_type.value if document.retention_type else None,
        status=document.status.value if document.status else None,
        retention_id=document.retention_id,
        retention_expires=document.retention_expires
    )

def document_file_to_db(file: DocumentFile) -> DocumentFiles:
    return DocumentFiles(
        document_id=file.document_id,
        version=file.version,
        uploaded_at=file.uploaded_at,
        uploader_id=file.uploader_id,
        file_size=file.file_size,
        file_type=file.file_type,
        physical_path=file.physical_path,
        file_name=file.file_name,
        summary=file.summary
    )
