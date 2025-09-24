from fastapi import APIRouter, Depends, Query
from dependency_injector.wiring import Provide, inject

from app.core.container import Container
from app.core.dependencies import require_admin
from app.core.security import CurrentUser
from app.schema.analytics_schema import AnalyticsOut
from app.services.analytics_service import AnalyticsService

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
