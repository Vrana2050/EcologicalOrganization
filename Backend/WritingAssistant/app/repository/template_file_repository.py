# app/repository/template_file_repository.py
from __future__ import annotations
from contextlib import AbstractContextManager
from pathlib import Path
from typing import Callable, Optional
import uuid

from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.template_file import TemplateFile
from app.core.exceptions import ValidationError


class TemplateFileRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, TemplateFile)

    def save_to_storage(
        self,
        *,
        content: bytes,
        original_name: str,
        mime_type: Optional[str],
        storage_dir: Path,
        session: Optional[Session] = None,
    ) -> TemplateFile:
        if not content:
            raise ValidationError(detail="Prazan fajl.")
        if not original_name:
            raise ValidationError(detail="Nedostaje naziv fajla.")
        storage_dir.mkdir(parents=True, exist_ok=True)
        safe_name = f"{uuid.uuid4().hex}_{original_name}"
        file_path = storage_dir / safe_name
        file_path.write_bytes(content)
        if session is not None:
            tf = TemplateFile(
                path=str(file_path),
                original_name=original_name,
                mime_type=mime_type,
                size_bytes=len(content),
            )
            session.add(tf)
            session.flush()
            return tf
        with self.session_factory() as s:
            tf = TemplateFile(
                path=str(file_path),
                original_name=original_name,
                mime_type=mime_type,
                size_bytes=len(content),
            )
            s.add(tf)
            s.commit()
            s.refresh(tf)
            return tf
