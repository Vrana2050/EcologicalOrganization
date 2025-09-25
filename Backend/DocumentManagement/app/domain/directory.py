from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List

from app.domain.document import Document
from app.domain.metadata import CustomMetadataRule, CustomMetadataValue
from app.domain.permissions import Permission
from app.domain.retention import RetentionType, Retention


class DirectoryType(str, Enum):
    SYSTEM = "SYSTEM"
    REGULAR = "REGULAR"


@dataclass
class Directory:
    id: Optional[int]
    name: str
    created_at: datetime
    creator_id: int
    last_modified: datetime
    retention_type: RetentionType
    directory_type: DirectoryType
    parent_directory_id: Optional[int] = None
    retention_id: Optional[int] = None

    subdirectories: List[Directory] = field(default_factory=list)
    #retention: Optional[Retention] = None
    #custom_metadata_rules: List[CustomMetadataRule] = field(default_factory=list)
    documents: List[Document] = field(default_factory=list)
    #custom_metadata_values: List[CustomMetadataValue] = field(default_factory=list)
    permissions: List[Permission] = field(default_factory=list)
    #tag_assignments: List[TagAssignment] = field(default_factory=list)


    def is_section(self):
        return self.parent_directory_id is None
