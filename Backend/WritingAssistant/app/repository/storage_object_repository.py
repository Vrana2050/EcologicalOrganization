from __future__ import annotations
from contextlib import AbstractContextManager
from pathlib import Path
from typing import Callable, Optional
import uuid

from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.storage_object import StorageObject
from app.core.exceptions import ValidationError


class StorageObjectRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, StorageObject)

    def save_to_storage(
        self,
        *,
        content: bytes,
        original_name: str,
        mime_type: Optional[str],
        storage_dir: Path,
        created_by: Optional[int] = None,
        repo_folder_id: Optional[int] = None,
        session: Optional[Session] = None,
    ) -> StorageObject:
        if not content:
            raise ValidationError(detail="Prazan fajl.")
        if not original_name:
            raise ValidationError(detail="Nedostaje naziv fajla.")

        storage_dir.mkdir(parents=True, exist_ok=True)
        safe_name = f"{uuid.uuid4().hex}_{original_name}"
        file_path = storage_dir / safe_name
        file_path.write_bytes(content)

        def _persist(s: Session) -> StorageObject:
            so = StorageObject(
                path=str(file_path),
                original_name=original_name,
                mime_type=mime_type,
                size_bytes=len(content),
                created_by=created_by,
                repo_folder_id=repo_folder_id,
            )
            s.add(so)
            s.flush()
            return so

        if session is not None:
            return _persist(session)

        with self.session_factory() as s:
            so = _persist(s)
            s.commit()
            s.refresh(so)
            return so
