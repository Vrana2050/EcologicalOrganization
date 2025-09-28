from __future__ import annotations
from typing import Iterable, List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone

from weaviate.classes.query import Filter
from app.core.vector_client import get_client
from app.model.vector_models import (
    DOCUMENT_COLL, CHUNK_COLL, DocumentVector, ChunkVector
)

def _to_props(model) -> Dict[str, Any]:
    data = model.model_dump(exclude_none=True) if hasattr(model, "model_dump") else model.dict(exclude_none=True)

    data.pop("id", None)

    ts = data.get("created_at")
    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        data["created_at"] = ts.isoformat()

    return data

class VectorRepository:
    def __init__(self) -> None:
        self._client = get_client()

    def _docs(self):
        return self._client.collections.get(DOCUMENT_COLL)

    def _chunks(self):
        return self._client.collections.get(CHUNK_COLL)

    def insert_document(self, doc: DocumentVector, vector: List[float]) -> str:
        res = self._docs().data.insert(properties=_to_props(doc), vector=vector, uuid=doc.id)
        return str(res)

    def insert_chunk(self, ch: ChunkVector, vector: List[float]) -> str:
        res = self._chunks().data.insert(properties=_to_props(ch), vector=vector, uuid=ch.id)
        return str(res)

    def batch_insert_chunks(self, items: Iterable[Tuple[ChunkVector, List[float]]]) -> None:
        coll = self._chunks()
        with coll.batch.dynamic() as batch:
            for ch, vec in items:
                batch.add_object(properties=_to_props(ch), vector=vec, uuid=ch.id)

    @staticmethod
    def _filters(
        document_type_id: Optional[int] = None,
        section_name: Optional[str] = None,
        document_id: Optional[str] = None,
        storage_object_id: Optional[int] = None,
    ) -> Optional[Filter]:
        flt: Optional[Filter] = None
        def add(f: Filter):
            nonlocal flt
            flt = f if flt is None else (flt & f)
        if document_type_id is not None:
            add(Filter.by_property("document_type_id").equal(document_type_id))
        if section_name:
            add(Filter.by_property("section_name").equal(section_name))
        if document_id:
            add(Filter.by_property("document_id").equal(document_id))
        if storage_object_id is not None:
            add(Filter.by_property("storage_object_id").equal(storage_object_id))
        return flt

    def query_chunks_by_vector(self, vector: List[float], limit: int = 10, *,
                               document_type_id: Optional[int] = None,
                               section_name: Optional[str] = None,
                               document_id: Optional[str] = None,
                               storage_object_id: Optional[int] = None):
        flt = self._filters(document_type_id, section_name, document_id, storage_object_id)
        resp = self._chunks().query.near_vector(vector=vector, limit=limit, filters=flt)
        return [{"uuid": str(o.uuid), "distance": getattr(o.metadata, "distance", None), "properties": o.properties}
                for o in (resp.objects or [])]

    def hybrid_query_chunks(self, query_text: str, limit: int = 10, alpha: float = 0.5,
                            vector: Optional[List[float]] = None, *,
                            document_type_id: Optional[int] = None,
                            section_name: Optional[str] = None,
                            document_id: Optional[str] = None,
                            storage_object_id: Optional[int] = None):
        flt = self._filters(document_type_id, section_name, document_id, storage_object_id)
        resp = self._chunks().query.hybrid(query=query_text, vector=vector, alpha=alpha, limit=limit, filters=flt)
        return [{"uuid": str(o.uuid), "score": getattr(o.metadata, "score", None), "properties": o.properties}
                for o in (resp.objects or [])]
        
        
    def get_summary_text_by_storage_object_id(self, storage_object_id: int) -> Optional[str]:
        flt = Filter.by_property("storage_object_id").equal(storage_object_id)
        resp = self._docs().query.fetch_objects(filters=flt, limit=1)
        objs = resp.objects or []
        if not objs:
            return None
        props = objs[0].properties or {}
        return props.get("summary_text")
    
    
    def delete_by_storage_object_id(self, storage_object_id: int) -> None:
        flt = Filter.by_property("storage_object_id").equal(storage_object_id)
        self._docs().data.delete_many(where=flt)
        self._chunks().data.delete_many(where=flt)
