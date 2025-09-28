from __future__ import annotations
from pathlib import Path
from typing import Optional

from app.services.base_service import BaseService
from app.repository.storage_object_repository import StorageObjectRepository
from app.schema.storage_object_schema import (
    StorageObjectOut, StorageObjectPageOut, StorageObjectQuery, PatchStorageObject
)
from app.schema.pagination_schema import PaginationMeta



STORAGE_DIR = Path("app/storage/objects")


class StorageObjectService(BaseService):
    MAX_FILE_SIZE = 50 * 1024 * 1024 

    def __init__(self, repository: StorageObjectRepository, session_factory, ingestion_service=None):
        super().__init__(repository)
        self.repo = repository
        self.session_factory = session_factory
        self.ingestion = ingestion_service

    def list(self, page: int = 1, per_page: int = 20, repo_folder_id: Optional[int] = None) -> StorageObjectPageOut:
        q = StorageObjectQuery(
            page=page,
            per_page=per_page,
            deleted=0,
            repo_folder_id=repo_folder_id,
            ordering="-created_at",
        )
        result = self.repo.read_by_options(q, eager=False)
        items = [
            StorageObjectOut(
                id=o.id,
                original_name=o.original_name,
                mime_type=o.mime_type,
                size_bytes=o.size_bytes,
                repo_folder_id=o.repo_folder_id,
                path=o.path,
                created_by=o.created_by,
                created_at=o.created_at,
            )
            for o in result["founds"]
        ]
        return StorageObjectPageOut(
            items=items,
            meta=PaginationMeta(
                page=result["search_options"]["page"],
                per_page=result["search_options"]["per_page"],
                total_count=result["search_options"]["total_count"],
            ).dict(),
        )

    def add_from_upload(
        self,
        *,
        filename: str,
        content: bytes,
        mime_type: str | None,
        repo_folder_id: Optional[int],
        created_by: int,
        document_type_id: int,  
    ) -> StorageObjectOut:
        if not content:
            from app.core.exceptions import ValidationError
            raise ValidationError(detail="Fajl je prazan")
        if len(content) > self.MAX_FILE_SIZE:
            from app.core.exceptions import ValidationError
            raise ValidationError(detail="Fajl je prevelik")

        saved_file_path: Path | None = None

        with self.session_factory() as session:
            try:
                so = self.repo.save_to_storage(
                    content=content,
                    original_name=filename,
                    mime_type=mime_type,
                    storage_dir=STORAGE_DIR,
                    repo_folder_id=repo_folder_id,
                    created_by=created_by,
                    session=session,
                )
                session.flush()  
                saved_file_path = Path(so.path)

                if self.ingestion:
                    self.ingestion.ingest_uploaded_document(
                        content=content,
                        filename=so.original_name or "upload.bin",
                        mime_type=so.mime_type,
                        storage_object_id=so.id,
                        document_type_id=document_type_id,
                        title=so.original_name,
                    )

                session.commit()
                session.refresh(so)

                return StorageObjectOut(
                    id=so.id,
                    original_name=so.original_name,
                    mime_type=so.mime_type,
                    size_bytes=so.size_bytes,
                    repo_folder_id=so.repo_folder_id,
                    path=so.path,
                    created_by=so.created_by,
                    created_at=so.created_at,
                )

            except Exception:
                session.rollback()
                if saved_file_path and saved_file_path.exists():
                    saved_file_path.unlink(missing_ok=True)
                raise
            
            
    def get(self, object_id: int) -> StorageObjectOut:
        obj = self.repo.read_by_id(object_id)
        return StorageObjectOut(
            id=obj.id,
            original_name=obj.original_name,
            mime_type=obj.mime_type,
            size_bytes=obj.size_bytes,
            repo_folder_id=obj.repo_folder_id,
            path=obj.path,
            created_by=obj.created_by,
            created_at=obj.created_at,
        )

    def update_meta(self, object_id: int, patch: PatchStorageObject) -> StorageObjectOut:
        updated = self.repo.update(object_id, patch)
        return StorageObjectOut(
            id=updated.id,
            original_name=updated.original_name,
            mime_type=updated.mime_type,
            size_bytes=updated.size_bytes,
            repo_folder_id=updated.repo_folder_id,
            path=updated.path,
            created_by=updated.created_by,
            created_at=updated.created_at,
        )

    def remove(self, object_id: int) -> None:
        self.repo.delete_by_id(object_id)
