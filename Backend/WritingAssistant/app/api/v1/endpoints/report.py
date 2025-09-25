from fastapi import APIRouter, Depends, Query
from dependency_injector.wiring import Provide, inject
from app.core.container import Container
from app.core.dependencies import require_admin
from app.core.security import CurrentUser
from datetime import datetime
from typing import Optional
from app.services.report_service import build_doc_type_report_pdf_bytes, fastapi_pdf_response
from app.services.analytics_service import AnalyticsService

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
