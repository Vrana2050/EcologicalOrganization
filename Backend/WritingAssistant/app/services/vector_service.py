# app/services/vector_service.py
from __future__ import annotations
from typing import List, Tuple, Optional

from app.model.vector_models import DocumentVector, ChunkVector
from app.repository.vector_repository import VectorRepository
from app.core.exceptions import NotFoundError


class VectorService:
    def __init__(self, repository: VectorRepository):
        self.repo = repository

    def upsert_document_summary(self, doc: DocumentVector, vector: List[float]) -> str:
        return self.repo.insert_document(doc, vector)

    def upsert_chunk(self, ch: ChunkVector, vector: List[float]) -> str:
        return self.repo.insert_chunk(ch, vector)

    def upsert_chunks(self, pairs: List[Tuple[ChunkVector, List[float]]]) -> None:
        self.repo.batch_insert_chunks(pairs)

    def search_documents_by_vector(
        self,
        *,
        query_vec: List[float],
        limit: int = 8,
        document_type_id: int | None = None,
    ) -> List[Tuple[DocumentVector, float]]:
        rows = self.repo.query_documents_by_vector(
            query_vec=query_vec,
            limit=limit,
            document_type_id=document_type_id,
        )
        out: List[Tuple[DocumentVector, float]] = []
        for r in rows:
            props = r.get("properties") or {}
            dv = DocumentVector(
                id=r.get("uuid", ""),
                storage_object_id=props.get("storage_object_id"),
                document_type_id=props.get("document_type_id"),
                title=props.get("title"),
                summary_text=props.get("summary_text"),
                created_at=props.get("created_at"),
            )
            out.append((dv, float(r.get("distance") if r.get("distance") is not None else 1.0)))
        return out

    def search_chunks_by_vector(
        self,
        query_vec: List[float],
        limit: int = 10,
        *,
        document_type_id: int | None = None,
        section_name: str | None = None,
        document_id: str | None = None,
        storage_object_id: int | None = None,
        document_ids: Optional[List[str]] = None,
    ) -> List[Tuple[ChunkVector, float]]:
        rows = self.repo.query_chunks_by_vector(
            query_vec=query_vec,
            limit=limit,
            document_type_id=document_type_id,
            section_name=section_name,
            document_id=document_id,
            storage_object_id=storage_object_id,
            document_ids=document_ids,
        )
        out: List[Tuple[ChunkVector, float]] = []
        for r in rows:
            props = r.get("properties") or {}
            ch = ChunkVector(
                id=r.get("uuid", ""),
                document_id=props.get("document_id"),
                storage_object_id=props.get("storage_object_id"),
                document_type_id=props.get("document_type_id"),
                section_name=props.get("section_name"),
                chunk_index=props.get("chunk_index"),
                text=props.get("text"),
                created_at=props.get("created_at"),
            )
            out.append((ch, float(r.get("distance") if r.get("distance") is not None else 1.0)))
        return out

    def search_chunks_hybrid(
        self,
        query_text: str,
        limit: int = 10,
        alpha: float = 0.6,
        query_vec: List[float] | None = None,
        *,
        document_type_id: int | None = None,
        section_name: str | None = None,
        document_id: str | None = None,
        storage_object_id: int | None = None,
        document_ids: Optional[List[str]] = None,
    ) -> List[Tuple[ChunkVector, float]]:
        rows = self.repo.hybrid_query_chunks(
            query_text=query_text,
            limit=limit,
            alpha=alpha,
            vector=query_vec,
            document_type_id=document_type_id,
            section_name=section_name,
            document_id=document_id,
            storage_object_id=storage_object_id,
            document_ids=document_ids,
        )
        out: List[Tuple[ChunkVector, float]] = []
        for r in rows:
            props = r.get("properties") or {}
            ch = ChunkVector(
                id=r.get("uuid", ""),
                document_id=props.get("document_id"),
                storage_object_id=props.get("storage_object_id"),
                document_type_id=props.get("document_type_id"),
                section_name=props.get("section_name"),
                chunk_index=props.get("chunk_index"),
                text=props.get("text"),
                created_at=props.get("created_at"),
            )
            out.append((ch, float(r.get("distance") if r.get("distance") is not None else 1.0)))
        return out

    def get_summary(self, storage_object_id: int) -> str:
        txt = self.repo.get_summary_text_by_storage_object_id(storage_object_id)
        if not txt:
            raise NotFoundError(detail="Sažetak nije pronađen za dati dokument.")
        return txt

    def delete_by_storage_object_id(self, storage_object_id: int) -> None:
        self.repo.delete_by_storage_object_id(storage_object_id)
