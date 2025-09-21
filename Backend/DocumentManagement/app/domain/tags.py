from dataclasses import dataclass
from typing import Optional


@dataclass
class TagAssignment:
    tag_id: int
    id: Optional[int] = None
    document_id: Optional[int] = None
    directory_id: Optional[int] = None

@dataclass
class Tag:
    name: str
    id: Optional[int] = None
    description: Optional[str] = None

