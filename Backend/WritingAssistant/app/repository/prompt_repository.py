from contextlib import AbstractContextManager
from typing import Callable, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.repository.base_repository import BaseRepository
from app.model.prompt import Prompt
from app.core.exceptions import DuplicatedError

from app.schema.prompt_schema import CreatePrompt

class PromptRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, Prompt)

    def find_by_title_and_doc(self, title: str, document_type_id: int) -> Optional[Prompt]:
        with self.session_factory() as s:
            return (
                s.query(Prompt)
                .filter(
                    Prompt.title == title,
                    Prompt.document_type_id == document_type_id,
                    Prompt.deleted == 0,
                )
                .first()
            )

    def create_prompt(self, schema: CreatePrompt) -> Prompt:
        with self.session_factory() as s:
            exists = self.find_by_title_and_doc(schema.title, schema.document_type_id)
            if exists:
                raise DuplicatedError(
                    detail="Prompt with same title already exists for this document type"
                )

            obj = Prompt(**schema.dict())   
            s.add(obj)
            s.commit()
            s.refresh(obj)
            return obj

    def patch_update_time(self, id: int) -> Prompt:
        with self.session_factory() as s:
            s.query(Prompt).filter(Prompt.id == id, Prompt.deleted == 0).update(
                {"updated_at": func.current_timestamp()}
            )
            s.commit()
            return s.query(Prompt).filter(Prompt.id == id).first()
        
    def search_by_term(self, term: str, page: int = 1, per_page: int = 20) -> dict:

        with self.session_factory() as s:
            q = (
                s.query(Prompt)
                .filter(
                    Prompt.deleted == 0,
                    func.lower(Prompt.title).like(f"%{term.lower()}%")
                )
            )

            total_count = q.count()

            order_col = getattr(Prompt, "updated_at", getattr(Prompt, "id"))
            q = q.order_by(order_col.desc())

            rows = q.limit(per_page).offset((page - 1) * per_page).all()

            return {
                "founds": rows,
                "search_options": {
                    "page": page,
                    "per_page": per_page,
                    "ordering": "-updated_at",
                    "total_count": total_count,
                },
            }