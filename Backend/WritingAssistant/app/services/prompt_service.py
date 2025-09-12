from datetime import datetime, timezone
from app.schema.prompt_schema import CreatePrompt, PromptOut, PromptWithActiveVersionOut, PromptWithActiveVersionPageOut, PromptQuery, PatchPromptTitle
from app.schema.pagination_schema import PaginationMeta
from app.schema.prompt_version_schema import PromptVersionOut
from app.schema.document_type_schema import CreateDocumentType
from app.repository.prompt_repository import PromptRepository
from app.repository.document_type_repository import DocumentTypeRepository
from app.repository.prompt_active_history_repository import PromptActiveHistoryRepository
from app.model.document_type import DocumentType
from app.services.base_service import BaseService
from app.model.prompt import Prompt
from app.core.exceptions import ConflictError

class PromptService(BaseService):
    def __init__(
        self,
        repository: PromptRepository,
        doc_type_repo: DocumentTypeRepository,
        pah_repository: PromptActiveHistoryRepository,  
    ):
        super().__init__(repository)
        self.prompt_repo = repository
        self.doc_type_repo = doc_type_repo
        self.pah_repository = pah_repository            

    def add(self, schema: CreatePrompt, user_id: int) -> PromptOut:
        doc_type: DocumentType = self.doc_type_repo.get_by_name(schema.document_type_name)
        if not doc_type:
            create_schema = CreateDocumentType(name=schema.document_type_name)
            doc_type = self.doc_type_repo.create(create_schema)

        now = datetime.now(timezone.utc)

        schema.created_by = user_id
        schema.created_at = now
        schema.updated_at = now
        schema.deleted = 0
        schema.document_type_id = doc_type.id  

        prompt = self.prompt_repo.create_prompt(schema)

        return PromptOut(
            id=prompt.id,
            title=prompt.title,
            document_type_id=prompt.document_type_id,
            is_active=False,
            created_at=prompt.created_at,
            updated_at=prompt.updated_at,
        )

    def list_with_active_versions(self, page: int, per_page: int) -> PromptWithActiveVersionPageOut:
        query = PromptQuery(page=page, per_page=per_page, deleted=0)
        result = self.prompt_repo.read_by_options(query, eager=False)
        prompts = result["founds"]

        doc_type_ids = {p.document_type_id for p in prompts}
        active_map = self.pah_repository.get_latest_map_by_document_types(doc_type_ids)

        items: list[PromptWithActiveVersionOut] = []
        for p in prompts:
            active_version = None
            pv = active_map.get(p.document_type_id)
            is_active = pv is not None and pv.prompt_id == p.id
            if is_active:
                active_version = PromptVersionOut(
                    id=pv.id,
                    prompt_id=pv.prompt_id,
                    name=pv.name,
                    description=pv.description,
                    prompt_text=pv.prompt_text,
                    is_active=True,
                    created_at=pv.created_at,
                    updated_at=pv.updated_at,
                )

            items.append(
                PromptWithActiveVersionOut(
                    id=p.id,
                    title=p.title,
                    document_type_id=p.document_type_id,
                    is_active=is_active,
                    active_version=active_version,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
            )

        return PromptWithActiveVersionPageOut(
            items=items,
            meta=PaginationMeta(
                page=result["search_options"]["page"],
                per_page=result["search_options"]["per_page"],
                total_count=result["search_options"]["total_count"],
            ),
        )


    def remove(self, prompt_id: int) -> None:
        prompt = self.prompt_repo.read_by_id(prompt_id, eagers=[Prompt.prompt_version])

        active_version = self.pah_repository.get_active_prompt_version(prompt.document_type_id)


        if active_version and any(pv.id == active_version.id for pv in prompt.prompt_version):
            raise ConflictError(
                detail="Ne možeš obrisati prompt dok je neka njegova verzija aktivna. "
                       "Postavi drugi prompt kao aktivan i pokušaj ponovo."
            )


        self.prompt_repo.delete_by_id(prompt_id)

    def update_title(self, prompt_id: int, title: str, user_id: int) -> PromptOut:
        prompt = self.prompt_repo.read_by_id(prompt_id)

        patch = PatchPromptTitle(
            title=title,
            updated_at=datetime.now(timezone.utc),
        )
        updated = self.prompt_repo.update(prompt_id, patch)

        return PromptOut(
            id=updated.id,
            title=updated.title,
            document_type_id=updated.document_type_id,
            is_active=False,  
            created_at=updated.created_at,
            updated_at=updated.updated_at,
        )