from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class CreateSectionDraft(BaseModel):
    created_by: Optional[int]
    content: Optional[str] = None
    model_output: Optional[int] = None
    deleted: int = 0

class UpdateSectionDraft(BaseModel):
    content: Optional[str] = None

class SectionDraftOut(BaseModel):
    id: int
    content: Optional[str] = None


    class Config:
        from_attributes = True

class SaveDraftIn(BaseModel):
    content: str
