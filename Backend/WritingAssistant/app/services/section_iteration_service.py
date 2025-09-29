from datetime import datetime, timezone

from decimal import Decimal
from typing import Optional, List

from app.services.base_service import BaseService
from app.services.llm_service import LLMService
from app.services.document_type_service import DocumentTypeService

from app.repository.section_iteration_repository import SectionIterationRepository
from app.repository.session_section_repository import SessionSectionRepository
from app.repository.chat_session_repository import ChatSessionRepository
from app.repository.prompt_active_history_repository import PromptActiveHistoryRepository
from app.repository.global_instruction_repository import GlobalInstructionRepository
from app.repository.section_instruction_repository import SectionInstructionRepository
from app.repository.prompt_execution_repository import PromptExecutionRepository
from app.repository.model_output_repository import ModelOutputRepository
from app.repository.prompt_version_repository import PromptVersionRepository

from app.services.model_pricing_service import ModelPricingService

from app.core.exceptions import AuthError, NotFoundError
from app.schema.global_instruction_schema import CreateGlobalInstruction
from app.schema.section_instruction_schema import CreateSectionInstruction
from app.schema.section_iteration_schema import GenerateIterationIn
from app.schema.prompt_execution_schema import CreatePromptExecution
from app.schema.model_output_schema import CreateModelOutput
from app.schema.section_iteration_schema import (
    CreateSectionIteration,
    SectionIterationOut,
    ModelOutputOut,
)
from app.schema.section_instruction_schema import SectionInstructionOut

from app.model.session_section import SessionSection
from app.model.chat_session import ChatSession
from app.model.section_iteration import SectionIteration

from app.repository.section_draft_repository import SectionDraftRepository
from app.schema.section_draft_schema import CreateSectionDraft
from app.model.section_draft import SectionDraft
from app.schema.section_draft_schema import CreateSectionDraft, UpdateSectionDraft

from app.services.rag.retrieval_service import RetrievalService, RetrievalResult


from app.core.security import CurrentUser


class SectionIterationService(BaseService):
    def __init__(
        self,
        repository: SectionIterationRepository,
        session_section_repository: SessionSectionRepository,
        chat_session_repository: ChatSessionRepository,
        prompt_active_history_repository: PromptActiveHistoryRepository,
        gi_repo: GlobalInstructionRepository,
        si_repo: SectionInstructionRepository,
        exec_repo: PromptExecutionRepository,
        out_repo: ModelOutputRepository,
        llm_service: LLMService,
        doc_type_service: DocumentTypeService,
        pv_repo: PromptVersionRepository,   
        draft_repo: SectionDraftRepository,
        pricing_service: ModelPricingService,     
        retrieval_service: RetrievalService,              
    ):
        super().__init__(repository)
        self._iter_repo = repository
        self._sec_repo = session_section_repository
        self._sess_repo = chat_session_repository
        self._pah_repo = prompt_active_history_repository
        self._gi_repo = gi_repo
        self._si_repo = si_repo
        self._exec_repo = exec_repo
        self._out_repo = out_repo
        self._llm = llm_service
        self._dt_service = doc_type_service
        self._pv_repo = pv_repo   
        self._draft_repo = draft_repo
        self._pricing = pricing_service
        self._retrieval = retrieval_service

    def _get_section(self, section_id: int) -> SessionSection:
        section = self._sec_repo.read_by_id(section_id)
        if not section or getattr(section, "deleted", 0) == 1:
            raise NotFoundError(detail="Section not found")
        return section

    def _get_session_with_sections(self, session_id: int) -> ChatSession:
        session = self._sess_repo.read_by_id(
            session_id,
            eagers=[ChatSession.session_section]
        )
        return session

    def _assert_session_owner(self, session: ChatSession, user_id: int) -> None:
        if int(session.created_by) != int(user_id):
            raise AuthError(detail="Forbidden")

    def _require_document_type_id(self, session: ChatSession) -> int:
        if session.document_type_id is None:
            raise NotFoundError(detail="Session missing document type")
        return int(session.document_type_id)

    def _active_sections(self, session: ChatSession) -> List[SessionSection]:
        return [s for s in (session.session_section or []) if getattr(s, "deleted", 0) == 0]


    def _build_rag_context(self, r: RetrievalResult) -> str:
        if not r or not r.chunk_blocks:
            return ""
        parts: List[str] = []
        for b in r.chunk_blocks:
            parts.append(b.text)
        return "\n\n".join(parts).strip()

    def _compose_final_prompt(
        self,
        section: SessionSection,
        session_sections: List[SessionSection],
        base_prompt: str | None,
        global_text: str | None,
        section_text: str | None,
        rag_context: str | None = None,   
    ) -> str:
        current_section_name = (section.name or "").strip()

        section_names = ", ".join(
            [s.name.strip() for s in session_sections if getattr(s, "name", None)]
        )

        prompt = (base_prompt or "")
        prompt = prompt.replace("{CURRENT_SECTION_NAME}", current_section_name)
        prompt = prompt.replace("{SECTION_NAMES}", section_names)
        prompt = prompt.replace("{GLOBAL_INSTRUCTION}", (global_text or "").strip())
        prompt = prompt.replace("{SECTION_INSTRUCTION}", (section_text or "").strip())
        prompt = prompt.replace("{RAG_CONTEXT}", (rag_context or "").strip())  

        return prompt.strip()



    def get_by_seq(self, section_id: int, seq_no: int, user_id: int):
        section = self._sec_repo.read_by_id(section_id, eagers=[SessionSection.session])

        if section.session.created_by != user_id:
            raise AuthError(detail="Forbidden")
        if section.deleted == 1:
            raise NotFoundError(detail="Section not found")

        iteration = self._iter_repo.by_section_and_seq(section_id, seq_no)
        if not iteration:
            raise NotFoundError(detail="Iteration not found")

        return SectionIterationOut.model_validate(iteration)

    def _resolve_prompt_version(
        self,
        session_obj: ChatSession,
        document_type_id: int,
        current_user: CurrentUser,
    ):
        print("current user ", current_user)
        is_test = int(getattr(session_obj, "is_test_session", 0) or 0) == 1
        if is_test:
            if current_user.role != "ADMIN":
                raise AuthError(detail="Forbidden")
            pv_id = getattr(session_obj, "test_prompt_version_id", None)
            if not pv_id:
                raise NotFoundError(detail="Test session is missing prompt version")
            try:
                pv = self._pv_repo.read_by_id(int(pv_id))
            except NotFoundError:
                raise NotFoundError(detail="Prompt version not found")
            if getattr(pv, "deleted", 0) == 1:
                raise NotFoundError(detail="Prompt version not found")
            return pv

        dt = self._dt_service.get_including_deleted(document_type_id)
        if dt.deleted == 1:
            default_dt = self._dt_service.get_by_name_ci("Default")
            if not default_dt:
                raise NotFoundError(detail='Nije pronađen "Default" Document Type')
            pv = self._pah_repo.get_active_prompt_version(int(default_dt.id))
        else:
            pv = self._pah_repo.get_active_prompt_version(document_type_id)
            if pv is None or getattr(pv, "deleted", 0) == 1:
                default_dt = self._dt_service.get_by_name_ci("Default")
                if not default_dt:
                    raise NotFoundError(detail='Nije pronađen "Default" Document Type')
                pv = self._pah_repo.get_active_prompt_version(int(default_dt.id))
        if not pv:
            raise NotFoundError(detail="Aktivna verzija prompta nije podešena za traženi Document Type")
        return pv

    def _create_global_instruction(
        self, session_id: int, text_value: str | None, now: datetime
    ) -> int | None:
        txt = (text_value or "").strip()
        if not txt:
            return None
        gi = self._gi_repo.create(
            CreateGlobalInstruction(
                session_id=int(session_id),
                text_=txt,
                deleted=0,
                created_at=now,
            )
        )
        return int(gi.id)

    def _create_section_instruction(
        self, section_id: int, text_value: str | None, now: datetime
    ) -> int | None:
        txt = (text_value or "").strip()
        if not txt:
            return None
        si = self._si_repo.create(
            CreateSectionInstruction(
                session_section_id=int(section_id),
                text_=txt,
                deleted=0,
                created_at=now,
            )
        )
        return int(si.id)


    def _calculate_pricing(
        self,
        llm_res,
        when: datetime,
    ) -> tuple[Optional[int], Optional[Decimal]]:
        cost_usd: Optional[Decimal] = None
        pricing_id: Optional[int] = None

        try:
            pricing = self._pricing.get_active(
                provider=self._llm.provider,
                model=self._llm.model,
                when=when,
            )
            if pricing:
                pricing_id = int(pricing.id)
            if pricing and llm_res.status == "ok":
                cost_usd = self._llm.compute_cost_usd(
                    prompt_tokens=llm_res.prompt_tokens,
                    output_tokens=llm_res.output_tokens,
                    prompt_token_usd_per_million=pricing.prompt_token_usd or Decimal("0"),
                    completion_token_usd_per_million=pricing.completion_token_usd or Decimal("0"),
                )
        except Exception:
            pricing_id = None
            cost_usd = None

        return pricing_id, cost_usd

    def generate(
        self,
        section_id: int,
        payload: GenerateIterationIn,
        user_id: int,
        current_user,
    ) -> SectionIterationOut:
        section = self._get_section(section_id)
        session = self._get_session_with_sections(section.session_id)

        self._assert_session_owner(session, user_id)
        document_type_id = self._require_document_type_id(session)

        now = datetime.now(timezone.utc)
        prompt_version = self._resolve_prompt_version(session, document_type_id, current_user)
        base_prompt = prompt_version.prompt_text or ""
        active_sections = self._active_sections(session)
        
        
        rag_res = self._retrieval.retrieve_context(
            document_type_id=document_type_id,
            global_instruction=(payload.global_instruction or ""),
            section_instruction=(payload.section_instruction or ""),
        )
        
        rag_context = self._build_rag_context(rag_res)

        final_prompt = self._compose_final_prompt(
            section=section,
            session_sections=active_sections,
            base_prompt=base_prompt,
            global_text=payload.global_instruction,
            section_text=payload.section_instruction,
            rag_context=rag_context
        )

        start_time = datetime.now(timezone.utc).replace(tzinfo=None)
        llm_res = self._llm.generate(final_prompt)
        end_time = datetime.now(timezone.utc).replace(tzinfo=None)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)
        next_seq = self._iter_repo.next_seq_for_section(section_id)

        
        pricing_id, cost_usd = self._calculate_pricing(llm_res, end_time)   

        global_instruction_id = self._create_global_instruction(
            session_id=int(session.id),
            text_value=payload.global_instruction,
            now=now,
        )
        section_instruction_id = self._create_section_instruction(
            section_id=int(section_id),
            text_value=payload.section_instruction,
            now=now,
        )

        exec_ = self._exec_repo.create(
            CreatePromptExecution(
                prompt_version_id=int(prompt_version.id),
                session_id=int(session.id),
                status="ok" if llm_res.status == "ok" else "failed",
                created_by=int(user_id),
                deleted=0,
                section_instruction_id=section_instruction_id,
                global_instruction_id=global_instruction_id,
                final_prompt=final_prompt,
                error_code=llm_res.error_code,
                error_message=llm_res.error_message,
                prompt_tokens=llm_res.prompt_tokens,
                output_tokens=llm_res.output_tokens,
                cost_usd=(cost_usd if cost_usd is not None else 0),
                started_at=start_time,
                finished_at=end_time,
                pricing_id=pricing_id,
                duration_ms=duration_ms,
            )
        )

        out = self._out_repo.create(
            CreateModelOutput(
                prompt_execution_id=int(exec_.id),
                generated_text=llm_res.generated_text,
            )
        )

        iteration = self._iter_repo.create(
            CreateSectionIteration(
                seq_no=next_seq,
                session_id=int(session.id),
                session_section_id=int(section_id),
                deleted=0,
                section_instruction_id=section_instruction_id,
                model_output_id=int(out.id),
                section_draft_id=None,

            )
        )

        return SectionIterationOut(
            id=iteration.id,
            seq_no=iteration.seq_no,
            session_section_id=iteration.session_section_id,
            section_instruction=(
                SectionInstructionOut.model_validate(self._si_repo.read_by_id(section_instruction_id))
                if section_instruction_id else None
            ),
            model_output=ModelOutputOut.model_validate(out),
        )

    def upsert_draft_for_iteration(
        self,
        section_id: int,
        seq_no: int,
        content: str,
        user_id: int,
    ) -> SectionIterationOut:
        section = self._sec_repo.read_by_id(section_id, eagers=[SessionSection.session])
        if section.session.created_by != user_id:
            raise AuthError(detail="Forbidden")
        if section.deleted == 1:
            raise NotFoundError(detail="Section not found")

        it = self._iter_repo.by_section_and_seq(section_id, seq_no)
        if not it:
            raise NotFoundError(detail="Iteration not found")

        if it.section_draft_id:
            
            self._draft_repo.update_attr(int(it.section_draft_id), "content", content)
        else:

            draft = self._draft_repo.create(
                CreateSectionDraft(
                    created_by=int(user_id),
                    content=content,
                    model_output=int(it.model_output_id) if it.model_output_id else None,
                    deleted=0,
                )
            )
            self._iter_repo.update_attr(int(it.id), "section_draft_id", int(draft.id))


        it_updated = self._iter_repo.by_section_and_seq(section_id, seq_no)
        return SectionIterationOut.model_validate(it_updated)