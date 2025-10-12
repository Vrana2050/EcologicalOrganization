import hashlib
import os
from dataclasses import dataclass, field
from datetime import datetime, UTC
from enum import Enum
from typing import Optional, List

from app.constants import STORAGE_ROOT
from app.domain.metadata import CustomMetadataValue
from app.domain.permissions import Permission
from app.domain.retention import RetentionType
from app.domain.tags import TagAssignment, Tag


# --- ENUMS ---


class DocumentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    RECYCLED = "RECYCLED"


@dataclass
class DocumentFile:
    version: int
    uploaded_at: datetime
    uploader_id: int
    file_size: int
    file_type: str
    physical_path: str
    file_name: str
    document_id: Optional[int] = None
    summary: Optional[str] = None

    def generate_physical_path(self):
        hash_input = f"{self.document_id}:{self.version}:{datetime.now(UTC)}".encode("utf-8")
        file_hash = hashlib.sha256(hash_input).hexdigest().lower()

        self.physical_path = os.path.join(STORAGE_ROOT, f"{file_hash}{self.file_type}")
        os.makedirs(os.path.dirname(self.physical_path), exist_ok=True)


@dataclass
class Document:
    created_at: datetime
    creator_id: int
    name: str
    last_modified: datetime
    parent_directory_id: int
    active_version: int
    retention_type: RetentionType
    status: DocumentStatus
    id: Optional[int] = None
    retention_id: Optional[int] = None
    retention_expires: Optional[datetime] = None

    # retention: Optional[Retention] = None
    custom_metadata_values: List[CustomMetadataValue] = field(default_factory=list)
    document_files: List[DocumentFile] = field(default_factory=list)
    permissions: List[Permission] = field(default_factory=list)
    tags: List[Tag] = field(default_factory=list)


