from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.schema.pagination_schema import PaginationMeta



class CreateChatSession(BaseModel):
    template_id: int
    created_by: Optional[int] = None
    deleted: Optional[int] = 0
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ChatSessionOut(BaseModel):
    id: int
    template_id: int
    created_by: int
    title: Optional[str]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  


class ChatSessionQuery(BaseModel):
    created_by: int
    deleted: int = 0
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1)
    ordering: str = "-updated_at"




class ChatSessionPageOut(BaseModel):
    items: List[ChatSessionOut]
    meta: PaginationMeta


class PatchChatSessionTitle(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    updated_at: Optional[datetime] = None



