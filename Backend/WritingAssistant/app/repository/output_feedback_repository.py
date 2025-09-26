from contextlib import AbstractContextManager
from typing import Callable, Tuple, List, Dict, Any
from sqlalchemy.orm import Session, aliased
from sqlalchemy import desc

from app.repository.base_repository import BaseRepository
from app.model.output_feedback import OutputFeedback
from app.model.model_output import ModelOutput
from app.model.prompt_execution import PromptExecution
from app.model.prompt_version import PromptVersion
from app.model.prompt import Prompt
from app.schema.output_feedback_schema import CreateOutputFeedback


class OutputFeedbackRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        super().__init__(session_factory, OutputFeedback)

    def _page(self, page: int | None, per_page: int | None) -> Tuple[int, int]:
        p = page or 1
        pp = per_page or 5
        return (max(1, int(p)), max(1, int(pp)))

    def _base_query_list(self, s: Session):
        mo = aliased(ModelOutput)
        pe = aliased(PromptExecution)
        pv = aliased(PromptVersion)
        p = aliased(Prompt)

        q = (
            s.query(
                OutputFeedback.id.label("id"),
                OutputFeedback.rating_value.label("rating_value"),
                OutputFeedback.comment_text.label("comment_text"),
                OutputFeedback.created_at.label("created_at"),
                OutputFeedback.created_by.label("created_by"),
                OutputFeedback.created_by_email.label("created_by_email"),
            )
            .join(mo, mo.id == OutputFeedback.model_output_id)
            .join(pe, pe.id == mo.prompt_execution_id)
            .join(pv, pv.id == pe.prompt_version_id)
            .join(p, p.id == pv.prompt_id)
            .filter(
                OutputFeedback.deleted == 0,
                mo.deleted == 0,
                pe.deleted == 0,
                pv.deleted == 0,
                p.deleted == 0,
            )
            .order_by(desc(OutputFeedback.created_at), desc(OutputFeedback.id))
        )
        return q, pv, p

    def _base_query_details(self, s: Session):
        mo = aliased(ModelOutput)
        pe = aliased(PromptExecution)
        pv = aliased(PromptVersion)
        p = aliased(Prompt)

        q = (
            s.query(
                OutputFeedback.id.label("id"),
                OutputFeedback.rating_value.label("rating_value"),
                OutputFeedback.comment_text.label("comment_text"),
                OutputFeedback.created_at.label("created_at"),
                OutputFeedback.created_by.label("created_by"),
                OutputFeedback.created_by_email.label("created_by_email"),
                pe.final_prompt.label("final_prompt"),
                mo.generated_text.label("generated_text"),
            )
            .join(mo, mo.id == OutputFeedback.model_output_id)
            .join(pe, pe.id == mo.prompt_execution_id)
            .join(pv, pv.id == pe.prompt_version_id)
            .join(p, p.id == pv.prompt_id)
            .filter(
                OutputFeedback.deleted == 0,
                mo.deleted == 0,
                pe.deleted == 0,
                pv.deleted == 0,
                p.deleted == 0,
            )
        )
        return q

    def list_for_prompt(self, prompt_id: int, page: int = 1, per_page: int = 5) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        with self.session_factory() as s:
            q, pv, p = self._base_query_list(s)
            q = q.filter(p.id == int(prompt_id))  
            total = q.count()
            pnum, pp = self._page(page, per_page)
            rows = q.limit(pp).offset((pnum - 1) * pp).all()
            items = [dict(r._mapping) for r in rows]
            return items, {"page": pnum, "per_page": pp, "total_count": total}

    def list_for_version(self, version_id: int, page: int = 1, per_page: int = 5) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        with self.session_factory() as s:
            q, pv, p = self._base_query_list(s)
            q = q.filter(pv.id == int(version_id)) 
            total = q.count()
            pnum, pp = self._page(page, per_page)
            rows = q.limit(pp).offset((pnum - 1) * pp).all()
            items = [dict(r._mapping) for r in rows]
            return items, {"page": pnum, "per_page": pp, "total_count": total}

    def get_details(self, feedback_id: int) -> Dict[str, Any] | None:
        with self.session_factory() as s:
            q = self._base_query_details(s).filter(OutputFeedback.id == int(feedback_id))
            row = q.first()
            if not row:
                return None
            m = dict(row._mapping)
            details = {
                "final_prompt": m.pop("final_prompt", None),
                "generated_text": m.pop("generated_text", None),
            }
            m["details"] = details
            return m

    def create_feedback(self, schema: CreateOutputFeedback) -> OutputFeedback:
        with self.session_factory() as s:
            obj = OutputFeedback(**schema.dict())
            s.add(obj)
            s.commit()
            s.refresh(obj)
            return obj
