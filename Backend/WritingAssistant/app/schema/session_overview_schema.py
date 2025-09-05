# app/schema/session_overview_schema.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ModelOutputOut(BaseModel):
    id: int
    generated_text: Optional[str] = None
    class Config:
        from_attributes = True

class SectionInstructionOut(BaseModel):
    id: int
    text_: str
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class SectionIterationBrief(BaseModel):
    id: int
    seq_no: int
    session_section_id: int
    section_instruction: Optional[SectionInstructionOut] = None
    model_output: Optional[ModelOutputOut] = None
    class Config:
        from_attributes = True

class SessionSectionWithLatestOut(BaseModel):
    id: int
    session_id: int
    name: Optional[str] = None
    position: Optional[int] = None
    latest_iteration: Optional[SectionIterationBrief] = None
    class Config:
        from_attributes = True
