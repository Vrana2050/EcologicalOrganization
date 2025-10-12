from pydantic import BaseModel
from typing import Any, List
from dependencies import MetadataType


class MetadataCreateDTO(BaseModel):
    id: int
    type: MetadataType
    value: Any


class DocumentUpdateDTO(BaseModel):
    id: int
    name: str
    tags: List[int]
    metadata: List[MetadataCreateDTO]


class DirectoryUpdateDTO(BaseModel):
    id: int
    name: str
    tags: List[int]
    metadata: List[MetadataCreateDTO]
