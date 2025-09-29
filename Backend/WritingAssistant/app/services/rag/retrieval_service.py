from __future__ import annotations
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass
import re

from app.services.rag.embedding_service import EmbeddingService
from app.services.vector_service import VectorService
from app.model.vector_models import DocumentVector, ChunkVector
from app.services.rag.retrieval_models import (
    RetrievalConfig,
    DocHit,
    ChunkBlock,
    RetrievalResult,
)

class RetrievalService:
    def __init__(self, embeddings: EmbeddingService, vectors: VectorService, cfg: Optional[RetrievalConfig] = None):
        self.emb = embeddings
        self.vec = vectors
        self.cfg = cfg or RetrievalConfig()

    def retrieve_context(
        self,
        *,
        document_type_id: int,
        global_instruction: str,
        section_instruction: str,
    ) -> RetrievalResult:
        q_docs_vec = self.emb.embed_query(global_instruction)
        doc_rows: List[Tuple[DocumentVector, float]] = self.vec.search_documents_by_vector(
            query_vec=q_docs_vec,
            limit=self.cfg.top_m_docs,
            document_type_id=document_type_id,
        )

        doc_hits, top_doc_ids, _ = self._select_docs(doc_rows)
        if not doc_hits:
            return RetrievalResult(doc_hits=[], chunk_blocks=[])

        q_chunks_vec = self.emb.embed_query(section_instruction)
        chunk_rows_all: List[Tuple[ChunkVector, float]] = self.vec.search_chunks_by_vector(
            query_vec=q_chunks_vec,
            limit=self.cfg.top_k_chunks * 3,
            document_ids=top_doc_ids,
        )

        top_chunks = self._topk_with_diversity(
            chunk_rows_all, k=self.cfg.top_k_chunks, max_per_doc=self.cfg.max_per_doc
        )

        blocks = self._merge_neighbors_into_blocks(top_chunks, chunks_all=chunk_rows_all)

        return RetrievalResult(
            doc_hits=doc_hits,
            chunk_blocks=blocks,
        )

    def _select_docs(
        self,
        docs: List[Tuple[DocumentVector, float]],
    ) -> Tuple[List[DocHit], List[str], List[float]]:
        docs_sorted = sorted(docs, key=lambda t: float(t[1]))  
        picked: List[Tuple[DocumentVector, float]] = []
        for dv, dist in docs_sorted:
            if len(picked) < self.cfg.top_m_docs:
                if dist <= self.cfg.max_doc_distance or not picked:
                    picked.append((dv, dist))
        hits: List[DocHit] = [
            DocHit(document_id=dv.id, title=dv.title, distance=float(dist))
            for dv, dist in picked
        ]
        return hits, [dv.id for dv, _ in picked], [float(d) for _, d in docs_sorted]

    def _topk_with_diversity(
        self,
        chunks: List[Tuple[ChunkVector, float]],
        k: int,
        max_per_doc: int,
    ) -> List[Tuple[ChunkVector, float]]:
        chunks_sorted = sorted(chunks, key=lambda t: float(t[1]))  
        per_doc: Dict[str, int] = {}
        out: List[Tuple[ChunkVector, float]] = []
        for ch, dist in chunks_sorted:
            if per_doc.get(ch.document_id, 0) >= max_per_doc:
                continue
            out.append((ch, dist))
            per_doc[ch.document_id] = per_doc.get(ch.document_id, 0) + 1
            if len(out) >= k:
                break
        return out

    def _merge_neighbors_into_blocks(
        self,
        top_chunks: List[Tuple[ChunkVector, float]],
        *,
        chunks_all: List[Tuple[ChunkVector, float]],
    ) -> List[ChunkBlock]:
        by_key: Dict[Tuple[str, int], Tuple[ChunkVector, float]] = {
            (c.document_id, c.chunk_index): (c, dist) for (c, dist) in chunks_all
        }
        used: set[Tuple[str, int]] = set()
        blocks: List[ChunkBlock] = []

        for ch, dist in sorted(top_chunks, key=lambda t: float(t[1])):  
            key = (ch.document_id, ch.chunk_index)
            if key in used:
                continue

            neigh_keys = [
                (ch.document_id, ch.chunk_index - 1),
                key,
                (ch.document_id, ch.chunk_index + 1),
            ]

            chosen: List[Tuple[ChunkVector, float]] = []
            for nk in neigh_keys:
                item = by_key.get(nk)
                if not item:
                    continue
                c2, d2 = item
                if (c2.section_name == ch.section_name) and (
                    nk == key or (d2 <= dist + self.cfg.neighbor_delta) or (d2 <= self.cfg.neighbor_abs_max)
                ):
                    chosen.append((c2, d2))

            if not chosen:
                continue

            chosen.sort(key=lambda t: t[0].chunk_index)
            merged_text = self._dedup_sentences(" ".join(c.text for (c, _) in chosen), section_name=ch.section_name)
            start_idx = chosen[0][0].chunk_index
            end_idx = chosen[-1][0].chunk_index
            block_dist = min(float(dx) for (_, dx) in chosen)

            blocks.append(ChunkBlock(
                document_id=ch.document_id,
                section_name=ch.section_name,
                chunk_indices=(start_idx, end_idx),
                text=merged_text,
                distance=float(block_dist),
            ))
            used.update((c.document_id, c.chunk_index) for (c, _) in chosen)

        return blocks

    def _dedup_sentences(self, text: str, section_name: Optional[str] = None) -> str:
        if not text:
            return ""
        s = re.sub(r"\s+", " ", text.strip())
        sentences = re.split(r'(?<=[.!?])\s+', s)
        seen = set()
        out: List[str] = []
        for sent in sentences:
            sent = sent.strip()
            if not sent:
                continue
            key = sent.lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(sent)
        prefix = f"[{section_name}] " if section_name else ""
        return prefix + " ".join(out)
