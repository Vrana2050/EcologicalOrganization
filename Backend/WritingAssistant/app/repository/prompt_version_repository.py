from contextlib import AbstractContextManager
from typing import Callable, Optional
from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.prompt_version import PromptVersion
from app.core.exceptions import DuplicatedError
from app.schema.prompt_version_schema import CreatePromptVersion


class PromptVersionRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, PromptVersion)

    def find_by_name_and_prompt(self, name: str, prompt_id: int) -> Optional[PromptVersion]:
        with self.session_factory() as s:
            return (
                s.query(PromptVersion)
                .filter(
                    PromptVersion.name == name,
                    PromptVersion.prompt_id == prompt_id,
                    PromptVersion.deleted == 0,
                )
                .first()
            )

    def create(self, schema: CreatePromptVersion) -> PromptVersion:
        with self.session_factory() as s:
            exists = self.find_by_name_and_prompt(schema.name, schema.prompt_id)
            if exists:
                raise DuplicatedError(detail="Version with same name already exists for this prompt")

            obj = PromptVersion(**schema.dict(exclude_unset=True))
            s.add(obj)
            s.commit()
            s.refresh(obj)
            return obj
