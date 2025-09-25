from datetime import datetime

from pydantic import BaseModel, Field
from typing import Optional, Tuple

from app.domain.permissions import AccessType, PermissionValue


class PermissionCreateDTO(BaseModel):
    email: Optional[str] = Field(None, max_length=100)
    group_name: Optional[str] = Field(None, max_length=100)
    access_type: AccessType
    expires_at: Optional[datetime] = None
    directory_id: Optional[int] = None
    document_id: Optional[int] = None


