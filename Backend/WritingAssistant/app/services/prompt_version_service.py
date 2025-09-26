from datetime import datetime, timezone

from app.services.base_service import BaseService
from app.schema.prompt_version_schema import (
    CreatePromptVersion,
    PromptVersionOut,
    PatchPromptVersionPromptText,
    PromptVersionPageOut,
    PromptVersionQuery,
    PatchPromptVersionBasicInfo,
)
from app.schema.pagination_schema import PaginationMeta
from app.schema.prompt_active_history_schema import CreatePromptActiveHistory

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
        schema.num_executions = 0
        schema.avg_duration_ms = None
        schema.avg_input_tokens = None
        schema.avg_output_tokens = None
        schema.avg_cost = None
        schema.total_cost_usd = None
        schema.error_rate = None
        schema.failed_exec_count = 0
        schema.rating_count = 0
        schema.rating_avg = None
        schema.rating_median = None
        schema.rating_c1 = 0
        schema.rating_c2 = 0
        schema.rating_c3 = 0
        schema.rating_c4 = 0
        schema.rating_c5 = 0
        schema.stats_finalized_at = None
        version = self.repo.create(schema)
        return PromptVersionOut.model_validate(version)

    def activate(self, version_id: int, user_id: int) -> PromptVersionOut:
        version = self.repo.read_by_id(version_id, eagers=[PromptVersion.prompt])
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
        out = PromptVersionOut.model_validate(version)
        return out.model_copy(update={"is_active": True})

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
        items = [PromptVersionOut.model_validate(v) for v in versions]
        items = [
            it.model_copy(update={"is_active": (it.id == active_id)})
            for it in items
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
        active = self.pah_repo.get_active_prompt_version(
            version.prompt.document_type_id
        )
        if active is not None and active.id == version.id:
            raise ConflictError(
                detail=(
                    "Ne možeš obrisati aktivnu verziju. "
                    "Postavi neku drugu verziju kao aktivnu i pokušaj ponovo."
                )
            )
        self.repo.delete_by_id(version_id)

    def update_basic_info(
        self, version_id: int, schema: PatchPromptVersionBasicInfo, user_id: int
    ) -> PromptVersionOut:
        schema.updated_at = datetime.now(timezone.utc)
        updated = self.repo.update(version_id, schema)
        return PromptVersionOut.model_validate(updated)

    def update_prompt_text(
        self, version_id: int, schema: PatchPromptVersionPromptText, user_id: int
    ) -> PromptVersionOut:
        schema.updated_at = datetime.now(timezone.utc)
        updated = self.repo.update(version_id, schema)
        return PromptVersionOut.model_validate(updated)
