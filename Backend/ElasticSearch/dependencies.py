from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Union, List, Any
from datetime import datetime, date, time
from dataclasses import dataclass

class GeneralOperator(str, Enum):
    IS = "is"  # time, datetime, date, integer, decimal, string, boolean
    IS_NOT = "is not"
    INCLUDES = "includes"  # string
    EXCLUDES = "excludes"  # string
    IS_BELOW = "is below"  # time, datetime, date, integer, decimal
    IS_ABOVE = "is above"
    AT_LEAST = "at least"
    AT_MOST = "at most"
    EXISTS = "exists"
    DOES_NOT_EXIST = "does not exist"


# ✅ Koji operatori su dozvoljeni za koje tipove vrednosti
VALID_OPERATORS = {
    "string": {
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.INCLUDES,
        GeneralOperator.EXCLUDES,
        GeneralOperator.EXISTS,
        GeneralOperator.DOES_NOT_EXIST,
    },
    "boolean": {
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.EXISTS,
        GeneralOperator.DOES_NOT_EXIST,
    },
    "datetime": {
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.IS_BELOW,
        GeneralOperator.IS_ABOVE,
        GeneralOperator.AT_LEAST,
        GeneralOperator.AT_MOST,
        GeneralOperator.EXISTS,
        GeneralOperator.DOES_NOT_EXIST,
    },
    "date": {
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.IS_BELOW,
        GeneralOperator.IS_ABOVE,
        GeneralOperator.AT_LEAST,
        GeneralOperator.AT_MOST,
        GeneralOperator.EXISTS,
        GeneralOperator.DOES_NOT_EXIST,
    },
    "time": {
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.IS_BELOW,
        GeneralOperator.IS_ABOVE,
        GeneralOperator.AT_LEAST,
        GeneralOperator.AT_MOST,
        GeneralOperator.EXISTS,
        GeneralOperator.DOES_NOT_EXIST,
    },
    "number": {  # integer, decimal
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.IS_BELOW,
        GeneralOperator.IS_ABOVE,
        GeneralOperator.AT_LEAST,
        GeneralOperator.AT_MOST,
        GeneralOperator.EXISTS,
        GeneralOperator.DOES_NOT_EXIST,
    },
}

class MetadataType(str, Enum):
    STRING = "String"
    BOOLEAN = "Boolean"
    DATE = "Date"
    DATETIME = "Datetime"
    TIME = "Time"
    INTEGER = "Integer"
    DECIMAL = "Decimal"

FIELD_MAP = {
    MetadataType.STRING: "value_string",
    MetadataType.BOOLEAN: "value_boolean",
    MetadataType.DATE: "value_date",
    MetadataType.DATETIME: "value_datetime",
    MetadataType.TIME: "value_time",
    MetadataType.INTEGER: "value_integer",
    MetadataType.DECIMAL: "value_decimal"
}


class MetadataFilter(BaseModel):
    id: int
    operator: GeneralOperator
    metadata_type: MetadataType
    value: Optional[Union[int, float, bool, datetime, date, time, str]] = None


class SearchTermType(str, Enum):
    ALL = "All"
    DOCUMENT_NAME = "Document Name"
    DIRECTORY_NAME = "Directory Name"
    CONTENT = "Content"



class AdvancedElasticSearchRequest(BaseModel):
    search_term: Optional[str] = Field(None)
    search_term_type: SearchTermType = Field(SearchTermType.ALL)
    parent_directory_ids: Optional[List[int]] = Field(None)
    created_from: Optional[datetime] = Field(None)
    created_to: Optional[datetime] = Field(None)
    creator_id: Optional[int] = Field(None)
    tags: List[int] = Field(default_factory=list)
    metadata: List[MetadataFilter] = Field(default_factory=list)
    allowed_directories: Optional[List[int]] = Field(default_factory=list)
    allowed_documents: Optional[List[int]] = Field(default_factory=list)
    page: int = Field(1, ge=1, description="Broj stranice (počinje od 1)")
    page_size: int = Field(20, ge=1, le=20, description="Broj rezultata po stranici (maks 20)")



@dataclass
class MetadataElasticDTO:
    metadata_id: int
    value: Any


@dataclass
class DirectorySearchResult:
    directory_id: int
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int
    score: float
    tags: list[int]
    metadata: list[MetadataElasticDTO]


@dataclass
class DocumentSearchResult:
    document_id: int
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int
    score: float
    tags: list[int]
    metadata: list[MetadataElasticDTO]
    summary: str


@dataclass
class SearchResults:
    directories: list[DirectorySearchResult]
    documents: list[DocumentSearchResult]
    total_count: int
    page: int
    page_size: int
    total_pages: Optional[int] = None


ES_OPERATOR_MAP = {
    "is": lambda field, value: {"term": {field: value}},
    "is not": lambda field, value: {"bool": {"must_not": {"term": {field: value}}}},
    "includes": lambda field, value: {"match": {field: value}},
    "excludes": lambda field, value: {"bool": {"must_not": {"match": {field: value}}}},
    "is below": lambda field, value: {"range": {field: {"lt": value}}},
    "is above": lambda field, value: {"range": {field: {"gt": value}}},
    "at least": lambda field, value: {"range": {field: {"gte": value}}},
    "at most": lambda field, value: {"range": {field: {"lte": value}}},
    "exists": lambda field, _: {"exists": {"field": field}},
    "does not exist": lambda field, _: {"bool": {"must_not": {"exists": {"field": field}}}}
}


def extract_metadata_value(meta: dict) -> Any:
    possible_fields = [
        "value_string",
        "value_boolean",
        "value_date",
        "value_datetime",
        "value_time",
        "value_integer",
        "value_decimal"
    ]

    for field in possible_fields:
        if field in meta and meta[field] is not None:
            return meta[field]
    return None