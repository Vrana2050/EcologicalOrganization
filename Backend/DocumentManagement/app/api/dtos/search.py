from dataclasses import dataclass
from datetime import datetime, time, date
from enum import Enum
from typing import Optional, Union, List, AnyStr, Any

from pydantic import BaseModel, Field, model_validator, field_validator

from app.domain.metadata import MetadataType

@dataclass
class MetadataElasticDTO:
    metadata_id: int
    value: Any



@dataclass
class DirectorySearchResult:
    directory_id: int
    access_type: str
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int
    score: float
    tags: list[str]
    metadata: list[MetadataElasticDTO]



@dataclass
class DocumentSearchResult:
    document_id: int
    access_type: str
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int
    score: float
    tags: list[str]
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


class GeneralOperator(str, Enum):
    IS = "is"
    IS_NOT = "is not"
    INCLUDES = "includes"
    EXCLUDES = "excludes"
    IS_BELOW = "is below"
    IS_ABOVE = "is above"
    AT_LEAST = "at least"
    AT_MOST = "at most"
    EXISTS = "exists"
    DOES_NOT_EXIST = "does not exist"


VALID_OPERATORS = {
    "string": {
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.INCLUDES,
        GeneralOperator.EXCLUDES,
        GeneralOperator.EXISTS,
        GeneralOperator.DOES_NOT_EXIST,
    },
    "number": {
        GeneralOperator.IS,
        GeneralOperator.IS_NOT,
        GeneralOperator.IS_BELOW,
        GeneralOperator.IS_ABOVE,
        GeneralOperator.AT_LEAST,
        GeneralOperator.AT_MOST,
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
}




class SearchTermType(str, Enum):
    ALL = "All"
    DOCUMENT_NAME = "Document Name"
    DIRECTORY_NAME = "Directory Name"
    CONTENT = "Content"


class MetadataFilter(BaseModel):
    id: int
    operator: GeneralOperator
    metadata_type: Optional[MetadataType] = MetadataType.STRING
    value: Optional[Union[int, float, bool, datetime, date, time, str]] = None

    @field_validator("value", mode="before")
    def parse_date_or_datetime(cls, v):
        if isinstance(v, str):
            # prvo probaj kao datetime (npr. "2025-10-24T09:00:00")
            try:
                return datetime.fromisoformat(v)
            except ValueError:
                pass
            # ako ne uspe, probaj kao date (npr. "2025-10-24")
            try:
                return date.fromisoformat(v)
            except ValueError:
                pass

            try:
                return time.fromisoformat(v)
            except ValueError:
                pass
        return v


    @model_validator(mode="after")
    def validate_operator_value_match(self):
        operator = self.operator
        value = self.value

        if operator in {GeneralOperator.EXISTS, GeneralOperator.DOES_NOT_EXIST}:
            return self

        if value is None:
            raise ValueError(f"Operator '{operator}' zahteva 'value' vrednost.")

        if isinstance(value, (int, float)):
            valid_set = VALID_OPERATORS["number"]
        elif isinstance(value, bool):
            valid_set = VALID_OPERATORS["boolean"]
        elif isinstance(value, (datetime, date, time)):
            valid_set = VALID_OPERATORS["datetime"]
        elif isinstance(value, str):
            valid_set = VALID_OPERATORS["string"]


        if operator not in valid_set:
            raise ValueError(
                f"Operator '{operator}' nije dozvoljen za tip vrednosti {type(value).__name__}."
            )

        return self


class AdvancedSearchRequest(BaseModel):
    search_term: Optional[str] = Field(None, alias="searchTerm")
    search_term_type: SearchTermType = Field(SearchTermType.ALL, alias="searchTermType")
    parent_directory_name: Optional[str] = Field(None, alias="folderName")
    created_from: Optional[datetime] = Field(None, alias="createdFrom")
    created_to: Optional[datetime] = Field(None, alias="createdTo")
    creator_email: Optional[str] = Field(None, alias="creatorEmail")
    tags: List[int] = Field(default_factory=list)
    metadata: List[MetadataFilter] = Field(default_factory=list)
    page: int = Field(1, ge=1, description="Broj stranice (počinje od 1)")
    page_size: int = Field(20, ge=1, le=20, description="Broj rezultata po stranici (maks 20)")

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True

    @model_validator(mode="after")
    def clean_fields(self):
        if self.creator_email:
            self.creator_email = self.creator_email.strip() or None
        if self.search_term:
            self.search_term = self.search_term.strip() or None
        if self.parent_directory_name:
            self.parent_directory_name = self.parent_directory_name.strip() or None

        self.tags = list(set(self.tags))

        unique_metadata = {}
        for m in self.metadata:
            if m.id not in unique_metadata:
                unique_metadata[m.id] = m
        self.metadata = list(unique_metadata.values())

        return self

    def is_empty(self) -> bool:
        """Vraca True ako korisnik nije uneo nijedan kriterijum za pretragu."""
        return not any([
            self.search_term,
            self.parent_directory_name,
            self.created_from,
            self.created_to,
            self.creator_email,
            self.tags,
            self.metadata,
        ])


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
class DirectoryElasticSearchResult:
    directory_id: int
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int
    score: float
    tags: list[int]
    metadata: list[MetadataElasticDTO]


@dataclass
class DocumentElasticSearchResult:
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
class ElasticSearchResults:
    directories: list[DirectoryElasticSearchResult]
    documents: list[DocumentElasticSearchResult]
    total_count: int
    page: int
    page_size: int
    total_pages: Optional[int] = None



def map_directory_to_result(directory, access_type: str = "VIEWER", score: float = 1.0) -> DirectorySearchResult:
    """
    Mapira SQLAlchemy Directory objekat u DirectorySearchResult DTO.
    """
    return DirectorySearchResult(
        directory_id=directory.id,
        access_type=access_type,
        name=directory.name,
        created_at=directory.created_at,
        last_modified=directory.last_modified,
        creator_id=directory.creator_id,
        score=score,
        tags=[ta.tag.name for ta in directory.tag_assignments if ta.tag] if hasattr(directory, "tag_assignments") else [],
        metadata=[]
    )


def map_document_to_result(document, access_type: str = "VIEWER", score: float = 1.0) -> DocumentSearchResult:
    """
    Mapira SQLAlchemy Document objekat u DocumentSearchResult DTO.
    """
    return DocumentSearchResult(
        document_id=document.id,
        access_type=access_type,
        name=document.name,
        created_at=document.created_at,
        last_modified=document.last_modified,
        creator_id=document.creator_id,
        score=score,
        tags=[ta.tag.name for ta in document.tag_assignments if ta.tag] if hasattr(document, "tag_assignments") else [],
        metadata=[],
        summary=document.summary
    )

def map_to_elastic_search_request(request: AdvancedSearchRequest, parent_directory_ids: list[int], creator_id: int | None, allowed_directories: list[int], allowed_documents: list[int]) -> AdvancedElasticSearchRequest:
    return AdvancedElasticSearchRequest(
        search_term=request.search_term,
        search_term_type=request.search_term_type,
        parent_directory_ids=parent_directory_ids,
        created_from=request.created_from,
        created_to=request.created_to,
        creator_id=creator_id,
        tags=request.tags,
        metadata=request.metadata,
        allowed_directories=allowed_directories,
        allowed_documents=allowed_documents,
        page=request.page,
        page_size=request.page_size
    )


def map_elastic_to_document_search_results(elastic_result: DocumentElasticSearchResult, tags: list[str], access_type: str) -> DocumentSearchResult:
    return DocumentSearchResult(
        document_id=elastic_result.document_id,
        access_type=access_type,
        name=elastic_result.name,
        created_at=elastic_result.created_at,
        last_modified=elastic_result.last_modified,
        creator_id=elastic_result.creator_id,
        score=elastic_result.score,
        tags=tags,
        metadata=elastic_result.metadata,
        summary=elastic_result.summary
    )

def map_elastic_to_directory_search_results(elastic_result: DirectoryElasticSearchResult, tags: list[str], access_type: str) -> DirectorySearchResult:
    return DirectorySearchResult(
        directory_id=elastic_result.directory_id,
        access_type=access_type,
        name=elastic_result.name,
        created_at=elastic_result.created_at,
        last_modified=elastic_result.last_modified,
        creator_id=elastic_result.creator_id,
        score=elastic_result.score,
        tags=tags,
        metadata=elastic_result.metadata
    )


