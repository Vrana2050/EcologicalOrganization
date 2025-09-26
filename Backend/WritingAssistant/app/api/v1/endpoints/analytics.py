from fastapi import APIRouter, Depends, Query
from dependency_injector.wiring import Provide, inject

from app.core.container import Container
from app.core.dependencies import require_admin
from app.core.security import CurrentUser
from app.schema.analytics_schema import AnalyticsOut
from app.services.analytics_service import AnalyticsService
from app.schema.report_schema import DocTypeReportRow
from datetime import datetime
from typing import Optional, List

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/prompt-versions/{id}", response_model=AnalyticsOut)
@inject
def get_version_analytics(
    id: int,
    c: int = Query(10, description="Bayes prior weight"),
    _: CurrentUser = Depends(require_admin),
    service: AnalyticsService = Depends(Provide[Container.analytics_service]),
):
    return service.get_version_analytics(id, bayes_c=c)

@router.get("/prompts/{id}", response_model=AnalyticsOut)
@inject
def get_prompt_analytics(
    id: int,
    c: int = Query(10, description="Bayes prior weight"),
    _: CurrentUser = Depends(require_admin),
    service: AnalyticsService = Depends(Provide[Container.analytics_service]),
):
    return service.get_prompt_analytics(id, bayes_c=c)


@router.get("/doc-type-report")
@inject
def get_doc_type_report(
    from_ts: datetime = Query(..., description="ISO8601 sa TZ, npr. 2025-09-01T00:00:00+02:00"),
    to_ts:   datetime = Query(...),
    document_type_id: int | None = Query(None),
    include_total: bool = Query(True),
    _: CurrentUser = Depends(require_admin),
    service: AnalyticsService = Depends(Provide[Container.analytics_service]),
):
    return service.get_doc_type_report(from_ts, to_ts, document_type_id, include_total)