import requests
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel

from app.use_cases.elastic_search_client.directories import MetadataCreateDTO
from app.use_cases.elastic_search_client.search import ELASTIC_SEARCH_URL

ELASTIC_SEARCH_DOCUMENTS_URL = f"{ELASTIC_SEARCH_URL}/documents"


class DocumentCreateDTO(BaseModel):
    id: int
    name: str
    parent_directory_id: int
    created_at: datetime
    creator_id: int



class DocumentUpdateDTO(BaseModel):
    id: int
    name: str
    tags: list[int]
    metadata: list[MetadataCreateDTO]


class DocumentPatchDTO(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None


# 🔹 1. CREATE
def create_document(dto: DocumentCreateDTO):
    response = requests.post(
        f"{ELASTIC_SEARCH_DOCUMENTS_URL}/",
        data=dto.model_dump_json(),
        headers={"Content-Type": "application/json"},
    )
    if response.status_code != 200:
        raise Exception(f"Failed to create document: {response.text}")
    return response.json()


# 🔹 2. UPDATE
def update_document(dto: DocumentUpdateDTO):
    response = requests.put(
        f"{ELASTIC_SEARCH_DOCUMENTS_URL}/",
        data=dto.model_dump_json(),
        headers={"Content-Type": "application/json"},
    )
    if response.status_code != 200:
        raise Exception(f"Failed to update document: {response.text}")
    return response.json()


# 🔹 3. PATCH (delimično ažuriranje)
def patch_document(doc_id: int, dto: DocumentPatchDTO):
    response = requests.patch(
        f"{ELASTIC_SEARCH_DOCUMENTS_URL}/{doc_id}",
        data=dto.model_dump_json(),
        headers={"Content-Type": "application/json"},
    )
    if response.status_code != 200:
        raise Exception(f"Failed to patch document {doc_id}: {response.text}")
    return response.json()


# 🔹 4. DELETE
def delete_document(doc_id: int):
    response = requests.delete(f"{ELASTIC_SEARCH_DOCUMENTS_URL}/{doc_id}")
    if response.status_code != 200:
        raise Exception(f"Failed to delete document {doc_id}: {response.text}")
    return response.json()
