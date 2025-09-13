from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.dependencies import get_current_user_id, require_admin
from app.core.security import CurrentUser
from app.schema.prompt_schema import CreatePrompt, PromptOut, PromptWithActiveVersionPageOut, PatchPromptTitle


from app.services.prompt_service import PromptService


router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.post("", response_model=PromptOut)
@inject
def create_prompt(
    payload: CreatePrompt,
    _: CurrentUser = Depends(require_admin),  
    user_id: int = Depends(get_current_user_id),
    service: PromptService = Depends(Provide[Container.prompt_service]),
):
    return service.add(payload, user_id)

@router.delete("/{id}", status_code=204)
@inject
def delete_prompt(
    id: int,
    _: CurrentUser = Depends(require_admin),  
    service: PromptService = Depends(Provide[Container.prompt_service]),
):
    service.remove(id)
    return

@router.get("", response_model=PromptWithActiveVersionPageOut)
@inject
def list_prompts(
    page: int = 1,
    per_page: int = 20,
    service: PromptService = Depends(Provide[Container.prompt_service]),
    _: int = Depends(require_admin),  
):
    return service.list_with_active_versions(page=page, per_page=per_page)


@router.patch("/{prompt_id}/title", response_model=PromptOut)
@inject
def patch_prompt_title(
    prompt_id: int,
    payload: PatchPromptTitle,
    _: CurrentUser = Depends(require_admin),
    user_id: int = Depends(get_current_user_id),
    service: PromptService = Depends(Provide[Container.prompt_service]),
):
    return service.update_title(prompt_id, payload.title, user_id)

