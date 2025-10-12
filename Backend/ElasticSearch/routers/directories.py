from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, UTC
from elasticsearch import AsyncElasticsearch

from dependencies import FIELD_MAP
from schemas import DirectoryUpdateDTO

router = APIRouter(prefix="/directories", tags=["Directories"])
es = AsyncElasticsearch("http://localhost:9200")


class DirectoryCreateDTO(BaseModel):
    id: int
    name: str
    parent_directory_id: Optional[int] = None
    created_at: datetime
    creator_id: int


@router.post("/")
async def create_directory(dto: DirectoryCreateDTO):
    document = {
        "directory_id": dto.id,
        "name": dto.name,
        "parent_directory_id": dto.parent_directory_id,
        "creator_id": dto.creator_id,
        "created_at": dto.created_at,
        "last_modified": dto.created_at,
        "tags": [],
        "metadata": []
    }

    try:
        await es.index(index="directories", id=dto.id, document=document)
        return {"message": "Directory created successfully", "data": document}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/")
async def update_directory(dto: DirectoryUpdateDTO):
    try:
        existing = await es.get(index="directories", id=dto.id)
        source = existing["_source"]

        source["name"] = dto.name
        source["tags"] = dto.tags
        source["last_modified"] = datetime.now(UTC)

        new_metadata = []
        for meta in dto.metadata:
            meta_dict = {"id": meta.id}
            field = FIELD_MAP[meta.type]
            meta_dict[field] = meta.value
            new_metadata.append(meta_dict)

        source["metadata"] = new_metadata

        await es.index(index="directories", id=dto.id, document=source)
        return {"message": "Directory updated successfully", "data": source}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class DirectoryDeleteDTO(BaseModel):
    directory_ids: list[int]


@router.delete("/delete")
async def delete_directories(dto: DirectoryDeleteDTO):
    """
    Briše sve dokumente u datim direktorijumima i zatim same direktorijume.
    Ne koristi rekurziju — očekuje da su svi potrebni ID-jevi već prosleđeni.
    """
    try:
        if not dto.directory_ids:
            return {"message": "No directories provided."}

        # 🗑️ 1. Obriši sve dokumente koji pripadaju datim direktorijumima
        await es.delete_by_query(
            index="documents",
            body={
                "query": {
                    "terms": {"parent_directory_id": dto.directory_ids}
                }
            },
            refresh=True
        )

        # 🧹 2. Obriši same direktorijume
        await es.delete_by_query(
            index="directories",
            body={
                "query": {
                    "terms": {"directory_id": dto.directory_ids}
                }
            },
            refresh=True
        )

        return {"message": f"Directories {dto.directory_ids} and their documents have been deleted."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


