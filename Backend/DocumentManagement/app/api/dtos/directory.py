from pydantic import BaseModel, Field
from typing import Optional, List

from app.domain.permissions import PrincipalType, AccessType


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

