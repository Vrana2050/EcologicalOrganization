from datetime import datetime, timezone
from sqlalchemy import func

from app.services.base_service import BaseService
from app.repository.document_type_repository import DocumentTypeRepository
from app.model.document_type import DocumentType
from app.model.prompt import Prompt
from app.model.template import Template
from app.model.chat_session import ChatSession

from app.schema.document_type_schema import (
    CreateDocumentType,
    DocumentTypeOut,
    DocumentTypeQuery,
    DocumentTypePageOut,
    UpdateDocumentType,
)
from app.schema.pagination_schema import PaginationMeta
from app.core.exceptions import ConflictError, DuplicatedError, NotFoundError


class DocumentTypeService(BaseService):
    def __init__(self, repository: DocumentTypeRepository):
        super().__init__(repository)
        self.repo = repository

    def _assert_not_default(self, obj: DocumentType):
        if obj.name and obj.name.lower() == "default":
            raise ConflictError(detail='DocumentType Default se ne može menjati niti brisati.')

    def _has_dependencies(self, id: int) -> bool:
        with self.repo.session_factory() as s:
            prompt_cnt = (
                s.query(Prompt)
                .filter(Prompt.document_type_id == id, Prompt.deleted == 0)
                .count()
            )
            template_cnt = (
                s.query(ChatSession)
                .filter(ChatSession.document_type_id == id, ChatSession.deleted == 0)
                .count()
            )
            return (prompt_cnt + template_cnt) > 0


        return DocumentTypeOut.model_validate(obj)

    def list(self, page: int, per_page: int, name: str | None = None, ordering: str = "-updated_at") -> DocumentTypePageOut:
        q = DocumentTypeQuery(page=page, per_page=per_page, name=name, deleted=0, ordering=ordering)
        result = self.repo.read_by_options(q, eager=False)
        items = [DocumentTypeOut.model_validate(dt) for dt in result["founds"]]
        return DocumentTypePageOut(
            items=items,
            meta=PaginationMeta(**result["search_options"]),
        )
        

    def get(self, id: int) -> DocumentTypeOut:
        dt = self.repo.read_by_id(id)
        return DocumentTypeOut.model_validate(dt)

    def add(self, schema: CreateDocumentType) -> DocumentTypeOut:
        now = datetime.now(timezone.utc)
        schema.created_at = now
        schema.updated_at = now

        existing_any = self.repo.get_any_by_name(schema.name)
        if existing_any:
            if existing_any.deleted == 1:
                existing_any.deleted = 0
                existing_any.updated_at = now
                updated = self.repo.update_entity(existing_any)
                return DocumentTypeOut.model_validate(updated)
            raise DuplicatedError(detail="Dokument sa tim nazivom vec postoji")

        obj = self.repo.create(schema)
        return DocumentTypeOut.model_validate(obj)

    def update(self, id: int, schema: UpdateDocumentType) -> DocumentTypeOut:
        obj = self.repo.read_by_id(id)
        self._assert_not_default(obj)

        dup = None
        if schema.name:
            dup = self.repo.get_active_duplicate(schema.name, exclude_id=id)
            if dup:
                raise DuplicatedError(detail="Dokument sa tim nazivom vec postojis")

        obj.name = schema.name or obj.name
        obj.description = schema.description if schema.description is not None else obj.description
        updated = self.repo.update_entity(obj)

        return DocumentTypeOut.model_validate(updated)




    def remove(self, id: int) -> None:
        with self.repo.session_factory() as s:
            obj = s.query(DocumentType).filter(DocumentType.id == id).first()
            if not obj:
                raise NotFoundError(detail=f"not found id : {id}")

            self._assert_not_default(obj)

            if self._has_dependencies(id):
                raise ConflictError(
                    detail="Ne možeš obrisati Document Type dok postoje povezani aktivni zapisi."
                )

            obj.deleted = 1
            obj.updated_at = func.current_timestamp()
            s.add(obj)
            s.commit()

    def get_including_deleted(self, id: int) -> DocumentTypeOut:
        obj = self.repo.read_by_id_including_deleted(id)
        return DocumentTypeOut.model_validate(obj)

    def get_by_name_ci(self, name: str) -> DocumentTypeOut | None:
        obj = self.repo.get_by_name_ci(name)
        return DocumentTypeOut.model_validate(obj) if obj else None

    def get_by_name_ci_any(self, name: str) -> DocumentTypeOut | None:
        obj = self.repo.get_by_name_ci_any(name)
        return DocumentTypeOut.model_validate(obj) if obj else None