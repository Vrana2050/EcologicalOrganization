from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateSectionInstruction(BaseModel):
    session_section_id: int
    text_: str
    deleted: Optional[int] = 0


class SectionInstructionOut(BaseModel):
    id: int
    session_section_id: int
    text_: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True  
