from typing import Optional

from app.services.base_service import BaseService
from app.repository.repo_folder_repository import RepoFolderRepository
from app.schema.repo_folder_schema import (
    RepoFolderOut, RepoFolderPageOut, RepoFolderQuery,
    CreateRepoFolder, PatchRepoFolder,
)
from app.schema.pagination_schema import PaginationMeta
from app.core.exceptions import NotFoundError


class RepoFolderService(BaseService):
    def __init__(self, repository: RepoFolderRepository, session_factory):
        super().__init__(repository)
        self.repo = repository
        self.session_factory = session_factory

    def list(self, page: int = 1, per_page: int = 20, parent_id: Optional[int] = None) -> RepoFolderPageOut:
        q = RepoFolderQuery(
            page=page,
            per_page=per_page,
            deleted=0,
            parent_id=parent_id,
            ordering="-created_at",
        )
        result = self.repo.read_by_options(q, eager=False)

        items = [
            RepoFolderOut(
                id=f.id,
                name=f.name,
                parent_id=f.parent_id,
                created_by=f.created_by,
                created_at=f.created_at,
            )
            for f in result["founds"]
        ]

        return RepoFolderPageOut(
            items=items,
            meta=PaginationMeta(
                page=result["search_options"]["page"],
                per_page=result["search_options"]["per_page"],
                total_count=result["search_options"]["total_count"],
            ),
        )

    def get(self, folder_id: int) -> RepoFolderOut:
        f = self.repo.read_by_id(folder_id)
        return RepoFolderOut(
            id=f.id,
            name=f.name,
            parent_id=f.parent_id,
            created_by=f.created_by,
            created_at=f.created_at,
        )

    def add(self, payload: CreateRepoFolder, user_id: int) -> RepoFolderOut:
        if payload.parent_id is not None:
            self.repo.read_by_id(payload.parent_id)  

        create_payload = payload.copy(update={"created_by": user_id, "deleted": 0})
        created = self.repo.create(create_payload)

        return RepoFolderOut(
            id=created.id,
            name=created.name,
            parent_id=created.parent_id,
            created_by=created.created_by,
            created_at=created.created_at,
        )

    def update(self, folder_id: int, patch: PatchRepoFolder) -> RepoFolderOut:
        if patch.parent_id is not None:
            try:
                self.repo.read_by_id(patch.parent_id)
            except NotFoundError:
                raise NotFoundError(detail=f"Ne postoji parent folder id={patch.parent_id}")

        updated = self.repo.update(folder_id, patch)

        return RepoFolderOut(
            id=updated.id,
            name=updated.name,
            parent_id=updated.parent_id,
            created_by=updated.created_by,
            created_at=updated.created_at,
        )

    def remove(self, folder_id: int) -> None:
        self.repo.read_by_id(folder_id)

        ids = self.repo.collect_descendant_ids(folder_id)

        with self.session_factory() as s:
            self.repo.soft_delete_storage_objects_in_folders(s, ids)
            self.repo.soft_delete_many(s, ids)
            s.commit()
