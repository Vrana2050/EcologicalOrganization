from typing import Optional, List
from pydantic import BaseModel

from app.schema.section_iteration_schema import SectionIterationOut



class SessionSectionWithLatestOut(BaseModel):
    id: int
    session_id: int
    name: Optional[str] = None
    position: Optional[int] = None
    latest_iteration: Optional[SectionIterationOut] = None
    latest_global_instruction_text: Optional[str] = None
    class Config:
        from_attributes = True
