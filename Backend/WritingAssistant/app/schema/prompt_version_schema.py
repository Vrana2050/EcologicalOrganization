from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.schema.pagination_schema import PaginationMeta


class CreatePromptVersion(BaseModel):
    prompt_id: int
    name: str
    description: Optional[str] = None
    prompt_text: Optional[str] = None

    created_by: Optional[int] = None
    deleted: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PromptVersionOut(BaseModel):
    id: int
    prompt_id: int
    name: str
    description: Optional[str] = None
    prompt_text: Optional[str] = None
    is_active: bool = False   
    updated_at: datetime = None


    num_executions: Optional[int] = None
    avg_duration_ms: Optional[float] = None
    avg_input_tokens: Optional[float] = None
    avg_output_tokens: Optional[float] = None
    avg_cost: Optional[float] = None
    error_rate: Optional[float] = None
    
    total_cost_usd: Optional[float] = None
    rating_count: Optional[int] = None
    rating_avg: Optional[float] = None
    rating_median: Optional[float] = None
    stats_finalized_at: Optional[datetime] = None


class PromptVersionQuery(BaseModel):
    page: int = 1
    per_page: int = 20
    ordering: str = "-updated_at"

    prompt_id: Optional[int] = None
    deleted: int = 0

class PromptVersionPageOut(BaseModel):
    items: list[PromptVersionOut]
    meta: PaginationMeta



class PatchPromptVersionBasicInfo(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    updated_at: Optional[datetime] = None


class PatchPromptVersionPromptText(BaseModel):
    prompt_text: Optional[str] = None
    updated_at: Optional[datetime] = None
