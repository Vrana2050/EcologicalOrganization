from dataclasses import dataclass
from typing import Optional, List


@dataclass
class GroupMember:
    user_id: int
    group_id: int


@dataclass
class UserGroup:
    name: str
    description: Optional[str] = ""
    id: Optional[int] = None
    members: List[int] = None