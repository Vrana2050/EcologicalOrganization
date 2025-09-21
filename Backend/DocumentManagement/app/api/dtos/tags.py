from dataclasses import dataclass
from typing import Optional

from app.domain.tags import Tag


@dataclass
class CreateTagDTO:
    name: str
    description: Optional[str] = None

@dataclass
class TagDTO:
    id: int
    name: str
    description: Optional[str] = None



def create_tag_dto_to_domain(dto: CreateTagDTO) -> Tag:
    return Tag(
        id=None,
        name=dto.name,
        description=dto.description
    )

def tag_domain_to_dto(tag: Tag) -> TagDTO:
    return TagDTO(
        id=tag.id,
        name=tag.name,
        description=tag.description
    )

def tag_dto_to_domain(dto: TagDTO) -> Tag:
    return Tag(
        id=dto.id,
        name=dto.name,
        description=dto.description
    )
