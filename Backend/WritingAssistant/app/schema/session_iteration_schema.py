from typing import Optional
from pydantic import BaseModel
from app.schema.session_overview_schema import SectionInstructionOut, ModelOutputOut

class SectionIterationOut(BaseModel):
    id: int
    seq_no: int
    session_section_id: int
    section_instruction: Optional[SectionInstructionOut] = None
    model_output: Optional[ModelOutputOut] = None

    class Config:
        from_attributes = True
