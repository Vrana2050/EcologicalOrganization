from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, UTC
from elasticsearch import AsyncElasticsearch

from dependencies import FIELD_MAP
from schemas import DocumentUpdateDTO

router = APIRouter(prefix="/documents", tags=["Documents"])
es = AsyncElasticsearch("http://localhost:9200")


class DocumentCreateDTO(BaseModel):
    id: int
    name: str
    parent_directory_id: int
    created_at: datetime
    creator_id: int


@router.post("/")
async def create_document(dto: DocumentCreateDTO):
    document = {
        "document_id": dto.id,
        "name": dto.name,
        "summary": None,
        "parent_directory_id": dto.parent_directory_id,
        "creator_id": dto.creator_id,
        "created_at": dto.created_at,
        "last_modified": dto.created_at,
        "tags": [],
        "metadata": []
    }

    try:
        await es.index(index="documents", id=dto.id, document=document)
        return {"message": "Document created successfully", "data": document}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/")
async def update_document(dto: DocumentUpdateDTO):
    try:
        # ✅ Učitaj postojeći dokument
        existing = await es.get(index="documents", id=dto.id)
        source = existing["_source"]

        # ✅ Ažuriraj osnovna polja
        source["name"] = dto.name
        source["tags"] = dto.tags
        source["last_modified"] = datetime.now(UTC)

        # ✅ Ažuriraj metapodatke
        new_metadata = []
        for meta in dto.metadata:
            meta_dict = {"id": meta.id}
            field = FIELD_MAP[meta.type]
            meta_dict[field] = meta.value
            new_metadata.append(meta_dict)

        source["metadata"] = new_metadata

        # ✅ Upis u Elasticsearch
        await es.index(index="documents", id=dto.id, document=source)
        return {"message": "Document updated successfully", "data": source}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class DocumentPatchDTO(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None


# --- DELETE ---
@router.delete("/{doc_id}")
async def delete_document(doc_id: int):
    try:
        exists = await es.exists(index="documents", id=doc_id)
        if not exists:
            raise HTTPException(status_code=404, detail="Document not found")

        await es.delete(index="documents", id=doc_id)
        return {"message": f"Document {doc_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- PATCH ---
@router.patch("/{doc_id}")
async def patch_document(doc_id: int, dto: DocumentPatchDTO):
    try:
        existing = await es.get(index="documents", id=doc_id)
        source = existing["_source"]

        # Update only if provided
        if dto.name is not None:
            source["name"] = dto.name

        source["summary"] = dto.summary if dto.summary is not None else None
        source["last_modified"] = datetime.now(UTC)

        await es.index(index="documents", id=doc_id, document=source)
        return {"message": "Document patched successfully", "data": source}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))