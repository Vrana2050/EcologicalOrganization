from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List


class MetadataAppliesTo(str, Enum):
    DIRECTORY = "DIRECTORY"
    DOCUMENT = "DOCUMENT"
    BOTH = "BOTH"


class MetadataType(str, Enum):
    STRING = "String"
    BOOLEAN = "Boolean"
    DATE = "Date"
    DATETIME = "Datetime"
    TIME = "Time"
    INTEGER = "Integer"
    DECIMAL = "Decimal"


@dataclass
class CustomMetadataValue:
    id: int
    custom_metadata_id: Optional[int] = None
    document_id: Optional[int] = None
    directory_id: Optional[int] = None
    metadata_rule_id: Optional[int] = None
    value: Optional[str] = None
    is_missing_value: Optional[bool] = False


@dataclass
class CustomMetadataRule:
    id: int
    custom_metadata_id: int
    directory_id: int
    applies_to: MetadataAppliesTo
    is_required: Optional[bool] = False
    is_recursive: Optional[bool] = False

    custom_metadata: Optional["CustomMetadata"] = None



@dataclass
class CustomMetadata:
    name: str
    metadata_type: MetadataType
    description: Optional[str] = None
    id: Optional[int] = None


