from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

from app.domain.document import Document


@dataclass
class CustomMetadataDTO:
    id: int
    value: Optional[str]
    is_missing_value: Optional[bool]
    custom_metadata: dict  # ili poseban dataclass, zavisi od tvog ukusa


@dataclass
class DocumentFileDTO:
    version: int
    uploaded_at: datetime
    uploader: str  # email umesto user_id
    file_size: int
    file_type: str
    file_name: str
    file_path: str
    summary: Optional[str]


@dataclass
class PermissionValueDTO:
    id: int
    access_type: str
    expires_at: Optional[datetime]


@dataclass
class PermissionDTO:
    id: int
    principal_type: str
    user_id: Optional[int]
    user_email: Optional[str]
    group_id: Optional[int]
    group_name: Optional[str]
    permission_value: PermissionValueDTO


@dataclass
class TagDTO:
    id: int
    name: str
    description: Optional[str]

@dataclass
class PathItem:
    id: int
    name: str

@dataclass
class DocumentOpenDTO:
    id: int
    created_at: datetime
    creator: str  # email
    name: str
    last_modified: datetime
    parent_directory_id: int
    active_version: int
    access_type: str
    custom_metadata_values: List[CustomMetadataDTO]
    document_files: List[DocumentFileDTO]
    permissions: List[PermissionDTO]
    tags: List[TagDTO]
    path: Optional[List[PathItem]] = None


def document_to_dto(
    doc: Document,
    user_emails: dict[int, str],  # mapiranje {user_id: email}
    group_names: dict[int, str],   # mapiranje {group_id: name}
    access_type: str,
) -> DocumentOpenDTO:
    return DocumentOpenDTO(
        id=doc.id,
        created_at=doc.created_at,
        creator=user_emails.get(doc.creator_id, f"user_{doc.creator_id}"),
        name=doc.name,
        last_modified=doc.last_modified,
        parent_directory_id=doc.parent_directory_id,
        active_version=doc.active_version,
        access_type=access_type,
        custom_metadata_values=[
            CustomMetadataDTO(
                id=mv.id,
                value=mv.get_typed_value(),
                is_missing_value=mv.is_missing_value,
                custom_metadata={
                    "id": mv.custom_metadata.id,
                    "name": mv.custom_metadata.name,
                    "metadata_type": mv.custom_metadata.metadata_type,
                    "description": mv.custom_metadata.description,
                } if mv.custom_metadata else None
            )
            for mv in doc.custom_metadata_values
        ],
        document_files=[
            DocumentFileDTO(
                version=f.version,
                uploaded_at=f.uploaded_at,
                uploader=user_emails.get(f.uploader_id, f"user_{f.uploader_id}"),
                file_size=f.file_size,
                file_type=f.file_type,
                file_name=f.file_name,
                file_path=f.physical_path,
                summary=f.summary
            )
            for f in doc.document_files
        ],
        permissions=[
            PermissionDTO(
                id=p.id,
                principal_type=p.principal_type,
                user_id=p.user_id,
                user_email=user_emails.get(p.user_id) if p.user_id else None,
                group_id=p.group_id,
                group_name=group_names.get(p.group_id) if p.group_id else None,
                permission_value=PermissionValueDTO(
                    id=p.permission_value.id,
                    access_type=p.permission_value.access_type,
                    expires_at=p.permission_value.expires_at
                )
            )
            for p in doc.permissions
        ],
        tags=[
            TagDTO(
                id=t.id,
                name=t.name,
                description=t.description
            )
            for t in doc.tags
        ],
        path = None
    )
