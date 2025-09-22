from datetime import datetime
from typing import Optional
from pydantic import BaseModel, conint

class CreateOutputFeedback(BaseModel):
    model_output_id: int
    rating_value: conint(ge=1, le=5)
    comment_text: Optional[str] = None

    # popunjava servis
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    deleted: int = 0

class OutputFeedbackOut(BaseModel):
    id: int
    model_output_id: int
    rating_value: int
    comment_text: Optional[str] = None
    created_by: int
    created_at: datetime
