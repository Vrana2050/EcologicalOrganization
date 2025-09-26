from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class CreateOutputFeedback(BaseModel):
    model_output_id: int
    rating_value: Optional[int] = None
    comment_text: Optional[str] = None

    created_by: Optional[int] = None
    created_by_email: Optional[str] = None
    created_at: Optional[datetime] = None
    deleted: Optional[int] = 0


class OutputFeedbackOut(BaseModel):
    id: int
    model_output_id: int
    rating_value: Optional[int] = None
    comment_text: Optional[str] = None
    created_by: int
    created_by_email: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeedbackDetailsOut(BaseModel):
    final_prompt: Optional[str] = None
    generated_text: Optional[str] = None

    class Config:
        from_attributes = True


class OutputFeedbackItemOut(BaseModel):
    id: int
    rating_value: Optional[int] = None
    comment_text: Optional[str] = None
    created_at: Optional[datetime] = None
    created_by: int
    created_by_email: Optional[str] = None

    details: Optional[FeedbackDetailsOut] = None

    class Config:
        from_attributes = True


class OutputFeedbackPage(BaseModel):
    items: List[OutputFeedbackItemOut]
    meta: Dict[str, Any]

    class Config:
        from_attributes = True
