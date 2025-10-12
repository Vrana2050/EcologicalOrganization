from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, Field
from typing import Optional, List

from app.api.dtos.documents import MetadataUpdateDTO
from app.domain.permissions import PrincipalType, AccessType
from app.domain.tags import Tag
from app.infra.mappers.document_open import CustomMetadataDTO, TagDTO, PathItem


class CreateDirectoryDTO(BaseModel):
    name: str = Field(..., max_length=100)
    parent_directory_id: Optional[int] = None


class SectionReadDTO(BaseModel):
    directory_id: int
    directory_name: str = Field(..., max_length=100)
    principal_type: PrincipalType
    access_type: AccessType


class SectionsReadDTO(BaseModel):
    sections: List[SectionReadDTO]

@dataclass
class DirectoryUpdateDTO:
    directory_id: int
    directory_name: str
    tags: list[str]
    metadata: list[MetadataUpdateDTO]


@dataclass
class DirectoryInfoDTO:
    directory_id: int
    created_at: datetime
    creator: str  # email
    directory_name: str
    last_modified: datetime
    parent_directory_id: int
    custom_metadata_values: List[CustomMetadataDTO]
    tags: List[Tag]
    path: Optional[List[PathItem]] = None