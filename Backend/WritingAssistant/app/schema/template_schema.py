from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schema.pagination_schema import PaginationMeta


class TemplateOut(BaseModel):
    id: int
    name: str
    document_type_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TemplateQuery(BaseModel):
    page: int = 1
    per_page: int = 20
    ordering: str = "-updated_at"
    deleted: int = 0



class TemplatePageOut(BaseModel):
    items: List[TemplateOut]
    meta: PaginationMeta
