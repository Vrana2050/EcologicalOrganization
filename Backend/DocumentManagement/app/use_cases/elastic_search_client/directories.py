from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel
import requests
from .search import ELASTIC_SEARCH_URL

ELASTIC_SEARCH_DIRECTORIES_URL = f"{ELASTIC_SEARCH_URL}/directories"


class DirectoryCreateDTO(BaseModel):
    id: int
    name: str
    parent_directory_id: Optional[int] = None
    created_at: datetime
    creator_id: int


class MetadataCreateDTO(BaseModel):
    id: int
    type: str
    value: Any


class DirectoryUpdateDTO(BaseModel):
    id: int
    name: str
    tags: list[int]
    metadata: list[MetadataCreateDTO]


class DirectoryDeleteDTO(BaseModel):
    directory_ids: list[int]


# 🔹 1. CREATE
def create_directory(dto: DirectoryCreateDTO):
    response = requests.post(
        f"{ELASTIC_SEARCH_DIRECTORIES_URL}/",
        data=dto.model_dump_json(),
        headers={"Content-Type": "application/json"},
    )
    if response.status_code != 200:
        raise Exception(f"Failed to create directory: {response.text}")
    return response.json()


# 🔹 2. UPDATE
def update_directory(dto: DirectoryUpdateDTO):
    response = requests.put(
        f"{ELASTIC_SEARCH_DIRECTORIES_URL}/",
        data=dto.model_dump_json(),
        headers={"Content-Type": "application/json"},
    )
    if response.status_code != 200:
        raise Exception(f"Failed to update directory: {response.text}")
    return response.json()


# 🔹 3. DELETE
def delete_directories(dto: DirectoryDeleteDTO):
    response = requests.delete(
        f"{ELASTIC_SEARCH_DIRECTORIES_URL}/delete",
        data=dto.model_dump_json(),
        headers={"Content-Type": "application/json"},
    )
    if response.status_code != 200:
        raise Exception(f"Failed to delete directories: {response.text}")
    return response.json()