from __future__ import annotations
from pathlib import Path
import json

from sqlalchemy.orm import Session

from app.services.base_service import BaseService
from app.repository.template_repository import TemplateRepository
from app.repository.template_file_repository import TemplateFileRepository
from app.schema.template_schema import TemplateOut, TemplatePageOut, TemplateQuery
from app.schema.pagination_schema import PaginationMeta
from app.model.template import Template
from app.model.template_section import TemplateSection
from app.services.template_parsers.registry import pick_parser
from app.core.exceptions import ValidationError

STORAGE_DIR = Path("app/storage/templates")


class TemplateService(BaseService):
    MAX_FILE_SIZE = 5 * 1024 * 1024

    def __init__(self, repository: TemplateRepository, file_repository: TemplateFileRepository, session_factory):
        super().__init__(repository)
        self.repo = repository
        self.file_repo = file_repository
        self.session_factory = session_factory

    def list(self, page: int = 1, per_page: int = 20) -> TemplatePageOut:
        query = TemplateQuery(page=page, per_page=per_page, deleted=0, ordering="-updated_at")
        result = self.repo.read_by_options(query, eagers=[Template.document_type])
        items = [
            TemplateOut(
                id=t.id,
                name=t.name,
                document_type_id=t.document_type_id,
                document_type_name=t.document_type.name if t.document_type else None,
                updated_at=t.updated_at,
            )
            for t in result["founds"]
        ]
        return TemplatePageOut(
            items=items,
            meta=PaginationMeta(
                page=result["search_options"]["page"],
                per_page=result["search_options"]["per_page"],
                total_count=result["search_options"]["total_count"],
            ),
        )

    def add_from_upload(
        self,
        *,
        name: str,
        document_type_id: int,
        filename: str,
        content: bytes,
        mime_type: str,
        created_by: int,
    ) -> TemplateOut:
        
        if not content:
            raise ValidationError(detail="Fajl je prazan")

        if len(content) > self.MAX_FILE_SIZE:
            raise ValidationError(detail="Fajl ne može biti veći od 5MB")

        try:
            parser = pick_parser(filename, mime_type)
        except ValueError as e:
            raise ValidationError(detail=str(e))
        parsed = parser.parse(content, filename)
        with self.session_factory() as session:
            tf = self.file_repo.save_to_storage(
                content=content,
                original_name=filename,
                mime_type=mime_type,
                storage_dir=STORAGE_DIR,
                session=session,
            )
            tpl = Template(
                name=name,
                document_type_id=document_type_id,
                file_id=tf.id,
                json_schema=json.dumps(parsed.json_schema, ensure_ascii=False) if parsed.json_schema else None,
                created_by=created_by,
            )
            session.add(tpl)
            session.flush()
            for idx, title in enumerate(parsed.sections, start=1):
                session.add(
                    TemplateSection(
                        template_id=tpl.id,
                        name=(title or f"Sekcija {idx}")[:255],
                        position=idx,
                    )
                )
            session.commit()
            session.refresh(tpl)
        return TemplateOut(
            id=tpl.id,
            name=tpl.name,
            document_type_id=tpl.document_type_id,
            document_type_name=None,
            updated_at=tpl.updated_at,
        )
