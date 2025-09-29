from __future__ import annotations
from typing import List, Tuple, Optional
from uuid import uuid4
from datetime import datetime, timezone

from app.services.document_parser.registry import pick_document_parser
from app.services.rag.summarization_service import SummarizationService
from app.services.rag.chunking_service import ChunkingService
from app.services.rag.embedding_service import EmbeddingService

from app.model.vector_models import DocumentVector, ChunkVector
from app.services.vector_service import VectorService


class VectorIngestionService:
    def __init__(
        self,
        vector_service: VectorService,
        summarizer: SummarizationService,
        chunker: ChunkingService,
        embed: EmbeddingService,
    ):
        self.vec = vector_service
        self.summarizer = summarizer
        self.chunker = chunker
        self.embed = embed

    def ingest_uploaded_document(
        self,
        *,
        content: bytes,
        filename: str,
        mime_type: Optional[str],
        storage_object_id: int,
        document_type_id: int,
        title: Optional[str] = None,
    ) -> str:
        parser = pick_document_parser(filename, mime_type or "")
        parsed = parser.parse(content, filename)
        sections = parsed.sections

        full_text = "\n\n".join(
            f"# {s.name}\n{s.text}" for s in sections if s.text and s.text.strip()
        )
        summary_text = self.summarizer.summarize(full_text)

        doc_uuid = str(uuid4())  
        created_ts = datetime.now(timezone.utc)

        doc_vec = self.embed.embed_passage(summary_text)
        print(f"[INGEST] DOCUMENT id={doc_uuid} vec_len={len(doc_vec)}")

        doc_obj = DocumentVector(
            id=doc_uuid,
            storage_object_id=storage_object_id,
            document_type_id=document_type_id,
            title=title or filename,
            summary_text=summary_text,
            created_at=created_ts,
        )
        self.vec.upsert_document_summary(doc_obj, doc_vec)

        pairs: List[Tuple[ChunkVector, List[float]]] = []
        chunk_index = 0
        for s in sections:
            if not (s.text and s.text.strip()):
                continue
            for chunk_text in self.chunker.make_chunks(s.name, s.text):
                ch_obj = ChunkVector(
                    id=str(uuid4()),               
                    document_id=doc_uuid,          
                    storage_object_id=storage_object_id,
                    document_type_id=document_type_id,
                    section_name=s.name,
                    chunk_index=chunk_index,
                    text=chunk_text,
                    created_at=created_ts,
                )
                ch_vec = self.embed.embed_passage(chunk_text)
                pairs.append((ch_obj, ch_vec))

                chunk_index += 1

        if pairs:
            self.vec.upsert_chunks(pairs)
            print(f"[INGEST] Upisano chunkova: {len(pairs)} za document_id={doc_uuid}")


        return doc_uuid
