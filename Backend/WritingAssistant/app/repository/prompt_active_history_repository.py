from contextlib import AbstractContextManager
from typing import Callable, Optional
from sqlalchemy.orm import Session
from app.repository.base_repository import BaseRepository
from app.model.prompt_active_history import PromptActiveHistory
from app.model.prompt_version import PromptVersion
from app.core.exceptions import NotFoundError
from contextlib import AbstractContextManager
from typing import Callable, Dict, Iterable
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.repository.base_repository import BaseRepository
from app.model.prompt_active_history import PromptActiveHistory
from app.model.prompt_version import PromptVersion


class PromptActiveHistoryRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, PromptActiveHistory)

    def get_latest_map_by_document_types(
        self, document_type_ids: Iterable[int]
    ) -> Dict[int, PromptVersion]:


        ids = list({int(x) for x in document_type_ids if x is not None})
        if not ids:
            return {}

        with self.session_factory() as s:

            row_number = func.row_number().over(
                partition_by=PromptActiveHistory.document_type_id,
                order_by=PromptActiveHistory.activated_at.desc(),
            ).label("rn")


            subq = (
                s.query(
                    PromptActiveHistory.document_type_id.label("doc_type_id"),
                    PromptActiveHistory.prompt_version_id.label("pv_id"),
                    row_number,
                )
                .filter(
                    PromptActiveHistory.deleted == 0,
                    PromptActiveHistory.document_type_id.in_(ids),
                )
                .subquery()
            )

            latest = (
                s.query(subq.c.doc_type_id, PromptVersion)
                .join(PromptVersion, PromptVersion.id == subq.c.pv_id)
                .filter(
                    subq.c.rn == 1,
                    PromptVersion.deleted == 0,
                )
                .all()
            )

            result: Dict[int, PromptVersion] = {}
            for doc_type_id, pv in latest:
                result[int(doc_type_id)] = pv

            return result
        

    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, PromptActiveHistory)

    def get_active_prompt_version(self, document_type_id: int) -> PromptVersion:
        with self.session_factory() as s:
            pv = (
                s.query(PromptVersion)
                 .join(PromptActiveHistory, PromptActiveHistory.prompt_version_id == PromptVersion.id)
                 .filter(
                     PromptActiveHistory.document_type_id == document_type_id,
                     PromptActiveHistory.deleted == 0,
                     PromptVersion.deleted == 0,
                 )
                 .order_by(PromptActiveHistory.activated_at.desc())
                 .first()
            )
            if not pv:
                raise NotFoundError(detail="Active prompt version not configured for this document type")
            return pv
        


