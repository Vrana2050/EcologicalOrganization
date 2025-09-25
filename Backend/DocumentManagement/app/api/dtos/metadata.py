from pydantic import BaseModel
from typing import Optional

class CreateMetadataDTO(BaseModel):
    name: str
    metadata_type: str
    description: Optional[str] = None

class MetadataDTO(BaseModel):
    id: int
    name: str
    metadata_type: str
    description: Optional[str] = None
