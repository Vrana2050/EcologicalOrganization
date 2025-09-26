from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from app.core.container import Container
from app.core.dependencies import get_current_user_id
from app.core.exceptions import ValidationError
from app.schema.template_schema import TemplatePageOut, TemplateOut
from app.services.template_service import TemplateService

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=TemplatePageOut)
@inject
def list_templates(
    page: int = 1,
    per_page: int = 20,
    _: int = Depends(get_current_user_id),
    service: TemplateService = Depends(Provide[Container.template_service]),
):
    return service.list(page=page, per_page=per_page)


@router.post("", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
@inject
async def add_template(
    name: str = Form(...),
    document_type_id: int = Form(...),
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    service: TemplateService = Depends(Provide[Container.template_service]),
):
    content = await file.read()
    return service.add_from_upload(
        name=name.strip(),
        document_type_id=document_type_id,
        filename=file.filename or "",
        content=content,
        mime_type=file.content_type or "application/octet-stream",
        created_by=user_id,
    )
