from dataclasses import dataclass
from enum import Enum
from typing import Optional



class RetentionType(str, Enum):
    INHERITED = "INHERITED"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"



class ExpirationAction(str, Enum):
    DELETE = "DELETE"
    RECYCLE_BIN = "RECYCLE_BIN"
    ARCHIVE = "ARCHIVE"


@dataclass
class Retention:
    id: int
    expiration_action: ExpirationAction
    retention_days: int
    retention_weeks: int
    retention_months: int
    retention_years: int
    is_applied_to_subfolders: Optional[bool] = False
