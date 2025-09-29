from __future__ import annotations
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass


@dataclass
class RetrievalConfig:
    top_m_docs: int = 4
    max_doc_distance: float = 0.6
    top_k_chunks: int = 3
    max_per_doc: int = 2
    max_chunk_distance: float = 0.6
    neighbor_delta: float = 0.10           
    neighbor_abs_max: float = 0.75         


@dataclass
class DocHit:
    document_id: str
    title: Optional[str]
    distance: float


@dataclass
class ChunkBlock:
    document_id: str
    section_name: Optional[str]
    chunk_indices: Tuple[int, int]
    text: str
    distance: float


@dataclass
class RetrievalResult:
    doc_hits: List[DocHit]
    chunk_blocks: List[ChunkBlock]
