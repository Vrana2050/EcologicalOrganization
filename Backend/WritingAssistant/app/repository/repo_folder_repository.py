from contextlib import AbstractContextManager
from typing import Callable, Iterable, List

from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.repo_folder import RepoFolder
from app.model.storage_object import StorageObject


class RepoFolderRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, RepoFolder)

    def list_children_ids(self, s: Session, parent_ids: Iterable[int]) -> list[int]:
        if not parent_ids:
            return []
        rows = (
            s.query(RepoFolder.id)
            .filter(
                RepoFolder.deleted == 0,
                RepoFolder.parent_id.in_(list(parent_ids)),
            )
            .all()
        )
        return [r[0] for r in rows]

    def collect_descendant_ids(self, root_id: int) -> list[int]:
        with self.session_factory() as s:
            all_ids: list[int] = []
            frontier: list[int] = [root_id]
            while frontier:
                all_ids.extend(frontier)
                frontier = self.list_children_ids(s, frontier)
            return all_ids

    def soft_delete_many(self, s: Session, ids: list[int]) -> None:
        if not ids:
            return
        (
            s.query(RepoFolder)
            .filter(RepoFolder.id.in_(ids))
            .update({"deleted": 1}, synchronize_session=False)
        )

    def soft_delete_storage_objects_in_folders(self, s: Session, folder_ids: list[int]) -> None:
        if not folder_ids:
            return
        (
            s.query(StorageObject)
            .filter(
                StorageObject.repo_folder_id.in_(folder_ids),
                getattr(StorageObject, "deleted") == 0,
            )
            .update({"deleted": 1}, synchronize_session=False)
        )
