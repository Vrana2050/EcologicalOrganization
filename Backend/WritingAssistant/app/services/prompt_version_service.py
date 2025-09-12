from datetime import datetime, timezone
from app.services.base_service import BaseService
from app.schema.prompt_version_schema import CreatePromptVersion, PromptVersionOut, PromptVersionPageOut, PromptVersionQuery
from app.schema.pagination_schema import PaginationMeta
from app.schema.prompt_active_history_schema import CreatePromptActiveHistory
from datetime import datetime, timezone
from app.repository.prompt_version_repository import PromptVersionRepository
from app.repository.prompt_repository import PromptRepository
from app.repository.prompt_active_history_repository import PromptActiveHistoryRepository
from app.core.exceptions import ConflictError

from app.model.prompt_version import PromptVersion


class PromptVersionService(BaseService):
    def __init__(
        self,
        repository: PromptVersionRepository,
        prompt_repo: PromptRepository,
        pah_repo: PromptActiveHistoryRepository,
    ):
        super().__init__(repository)           
        self.repo = repository
        self.prompt_repo = prompt_repo
        self.pah_repo = pah_repo

    def add(self, schema: CreatePromptVersion, user_id: int) -> PromptVersionOut:
        self.prompt_repo.read_by_id(schema.prompt_id)

        now = datetime.now(timezone.utc)
        schema.created_by = user_id
        schema.created_at = now
        schema.updated_at = now
        schema.deleted = 0

        version = self.repo.create(schema)

        return PromptVersionOut(
            id=version.id,
            prompt_id=version.prompt_id,
            name=version.name,
            description=version.description,
            prompt_text=version.prompt_text,
            is_active=False,
            created_at=version.created_at,
            updated_at=version.updated_at,
        )

    def activate(self, version_id: int, user_id: int) -> PromptVersionOut:
        version = self.repo.read_by_id(version_id, eagers=([PromptVersion.prompt]))
        now = datetime.now(timezone.utc)  

        self.pah_repo.create(
            CreatePromptActiveHistory(
                prompt_version_id=version.id,
                document_type_id=version.prompt.document_type_id,
                activated_by=user_id,
                activated_at=now,      
                deleted=0,
            )
        )

        return PromptVersionOut(
            id=version.id,
            prompt_id=version.prompt_id,
            name=version.name,
            description=version.description,
            prompt_text=version.prompt_text,
            is_active=True,
            created_at=version.created_at,
            updated_at=version.updated_at,
        )
    

    def list_for_prompt(
            self, prompt_id: int, page: int = 1, per_page: int = 20
        ) -> PromptVersionPageOut:
            prompt = self.prompt_repo.read_by_id(prompt_id)


            active_map = self.pah_repo.get_latest_map_by_document_types(
                [prompt.document_type_id]
            )
            active_pv = active_map.get(prompt.document_type_id)
            active_id = active_pv.id if active_pv else None


            query = PromptVersionQuery(
                page=page,
                per_page=per_page,
                prompt_id=prompt_id,
                deleted=0,
            )
            result = self.repo.read_by_options(query, eager=False)
            versions = result["founds"]

            items = [
                PromptVersionOut(
                    id=v.id,
                    prompt_id=v.prompt_id,
                    name=v.name,
                    description=v.description,
                    prompt_text=v.prompt_text,
                    is_active=(v.id == active_id),
                    created_at=v.created_at,
                    updated_at=v.updated_at,
                )
                for v in versions
            ]

            return PromptVersionPageOut(
                items=items,
                meta=PaginationMeta(
                    page=result["search_options"]["page"],
                    per_page=result["search_options"]["per_page"],
                    total_count=result["search_options"]["total_count"],
                ),
            )
    

    def remove_by_id(self, version_id: int) -> None:
            version = self.repo.read_by_id(version_id, eagers=[PromptVersion.prompt])


            active = self.pah_repo.get_active_prompt_version(version.prompt.document_type_id)

        
            if active.id == version.id:
                raise ConflictError(
                    detail="Ne možeš obrisati aktivnu verziju. "
                        "Postavi neku drugu verziju kao aktivnu i pokušaj ponovo."
                )

            self.repo.delete_by_id(version_id)