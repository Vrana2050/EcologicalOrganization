from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CreateGlobalInstruction(BaseModel):
    session_id: int
    text_: str
    deleted: Optional[int] = 0
    created_at: Optional[datetime] = None


class GlobalInstructionOut(BaseModel):
    id: int
    session_id: int
    text_: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
