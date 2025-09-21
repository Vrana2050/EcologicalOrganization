from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


# ==============================
# ENUMS
# ==============================

class AccessType(str, Enum):
    EDITOR = "EDITOR"
    VIEWER = "VIEWER"
    PREVIEW = "PREVIEW"


class AccessOrigin(str, Enum):
    INHERITED = "INHERITED"
    DIRECT = "DIRECT"


class PrincipalType(str, Enum):
    OWNER = "OWNER"
    MANAGER = "MANAGER"
    EMPLOYEE = "EMPLOYEE"
    GROUP = "GROUP"


# ==============================
# DOMAIN MODELS
# ==============================

@dataclass
class PermissionValue:
    id: Optional[int]
    access_type: AccessType
    expires_at: Optional[datetime] = None


@dataclass
class Permission:
    id: Optional[int]
    access_origin: AccessOrigin
    principal_type: Optional[PrincipalType]
    user_id: Optional[int] = None
    group_id: Optional[int] = None
    directory_id: Optional[int] = None
    document_id: Optional[int] = None
    parent_directory_id: Optional[int] = None
    permission_value_id: Optional[int] = None
    permission_value: Optional[PermissionValue] = None
