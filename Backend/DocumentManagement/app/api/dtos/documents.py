from dataclasses import dataclass
from fastapi import UploadFile

from app.domain.document import DocumentFile, Document


@dataclass
class DocumentCreateDTO:
    parent_directory_id: int
    uploaded_file: UploadFile


@dataclass
class DocumentReadDTO:
    document: Document
    versions: DocumentFile