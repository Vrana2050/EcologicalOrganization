from typing import Optional

from pydantic import BaseModel, Field


class UserGroupCreateDTO(BaseModel):
    name: str = Field(max_length=255)
    description: Optional[str] = Field("", max_length=500)


class GroupMemberDTO(BaseModel):
    id: int
    email: str

class UserGroupReadDTO(BaseModel):
    id: int
    name: str
    description: Optional[str] = Field("", max_length=500)
    members: list[GroupMemberDTO] = []
