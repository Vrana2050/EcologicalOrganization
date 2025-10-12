from dataclasses import dataclass
from fastapi import UploadFile
from typing import Any

from app.domain.document import DocumentFile, Document


@dataclass
class DocumentCreateDTO:
    parent_directory_id: int
    uploaded_file: UploadFile


@dataclass
class DocumentReadDTO:
    document: Document
    versions: DocumentFile


@dataclass
class MetadataUpdateDTO:
    metadata_id: int
    value: Any

@dataclass
class DocumentUpdateDTO:
    document_id: int
    document_name: str
    tags: list[str]
    metadata: list[MetadataUpdateDTO]