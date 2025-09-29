from fastapi import APIRouter, Depends, Query, Body
from dependency_injector.wiring import Provide, inject
from typing import Optional
from datetime import datetime

from app.core.container import Container
from app.core.dependencies import get_current_user_id, require_admin
from app.core.security import CurrentUser

from app.services.analytics_service import AnalyticsService
from app.repository.section_iteration_repository import SectionIterationRepository
from app.services.report_service import build_doc_type_report_pdf_bytes, fastapi_pdf_response

from app.services.report.document_report_service import (
    build_document_report_pdf_bytes as build_document_preview_pdf_bytes,
)
from app.services.session_section_service import SessionSectionService
from app.services.chat_session_service import ChatSessionService

from app.schema.report_schema import DocumentReportIn


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/doc-type-report.pdf")
@inject
def get_doc_type_report_pdf(
    from_ts: datetime = Query(...),
    to_ts: datetime = Query(...),
    document_type_id: Optional[int] = Query(None),
    include_total: bool = Query(True),
    sort_key: str = Query("document_type_name"),
    sort_dir: str = Query("asc"),
    tz: Optional[str] = Query(None),
    _: CurrentUser = Depends(require_admin),
    service: AnalyticsService = Depends(Provide[Container.analytics_service]),
):
    pdf = build_doc_type_report_pdf_bytes(
        service,
        from_ts,
        to_ts,
        document_type_id,
        include_total,
        sort_key,
        sort_dir,
        tz,
        "sr-RS",
    )
    return fastapi_pdf_response(pdf)


@router.post("/doc-report.pdf")
@inject
def get_doc_report_pdf(
    session_id: int = Query(..., description="ID sesije čiji se preview renderuje"),
    body: DocumentReportIn = Body(...),
    user_id: int = Depends(get_current_user_id),
    section_svc: SessionSectionService = Depends(Provide[Container.session_section_service]),
    session_svc: ChatSessionService = Depends(Provide[Container.chat_session_service]),
    iter_repo: SectionIterationRepository = Depends(Provide[Container.section_iteration_repository]),
):
    pdf = build_document_preview_pdf_bytes(
        session_id=session_id,
        user_id=user_id,
        section_service=section_svc,
        session_service=session_svc,
        section_iteration_repo=iter_repo,
        title_override=(body.title or "").strip() or None,
        selections=[s for s in body.selections or []],
    )
    return fastapi_pdf_response(pdf)
