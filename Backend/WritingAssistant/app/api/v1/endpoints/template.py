from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.dependencies import get_current_user_id  
from app.schema.template_schema import TemplatePageOut
from app.services.template_service import TemplateService

router = APIRouter(prefix="/templates")

@router.get("", response_model=TemplatePageOut)
@inject
def list_templates(
    page: int = 1,
    per_page: int = 20,
    _: int = Depends(get_current_user_id),  
    service: TemplateService = Depends(Provide[Container.template_service]),
):
    return service.list(page=page, per_page=per_page)
