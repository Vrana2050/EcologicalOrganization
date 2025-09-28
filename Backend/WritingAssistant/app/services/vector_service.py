from __future__ import annotations
from typing import List, Tuple

from app.model.vector_models import DocumentVector, ChunkVector
from app.repository.vector_repository import VectorRepository

class VectorService:
    def __init__(self, repository: VectorRepository):
        self.repo = repository

    def upsert_document_summary(self, doc: DocumentVector, vector: List[float]) -> str:
        return self.repo.insert_document(doc, vector)

    def upsert_chunk(self, ch: ChunkVector, vector: List[float]) -> str:
        return self.repo.insert_chunk(ch, vector)

    def upsert_chunks(self, pairs: List[Tuple[ChunkVector, List[float]]]) -> None:
        self.repo.batch_insert_chunks(pairs)

    def search_chunks_by_vector(
        self,
        query_vec: List[float],
        limit: int = 10,
        *,
        document_type_id: int | None = None,
        section_name: str | None = None,
        document_id: str | None = None,
        storage_object_id: int | None = None,
    ):
        return self.repo.query_chunks_by_vector(
            query_vec, limit,
            document_type_id=document_type_id,
            section_name=section_name,
            document_id=document_id,
            storage_object_id=storage_object_id,
        )

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
    ):
        return self.repo.hybrid_query_chunks(
            query_text, limit, alpha, query_vec,
            document_type_id=document_type_id,
            section_name=section_name,
            document_id=document_id,
            storage_object_id=storage_object_id,
        )
