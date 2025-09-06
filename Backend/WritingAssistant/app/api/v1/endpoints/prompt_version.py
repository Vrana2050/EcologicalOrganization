from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.dependencies import get_current_user_id, require_admin
from app.core.security import CurrentUser
from app.schema.prompt_version_schema import CreatePromptVersion, PromptVersionOut, PromptVersionPageOut, PromptVersionQuery
from app.services.prompt_version_service import PromptVersionService

router = APIRouter(prefix="/prompt-versions")


@router.post("", response_model=PromptVersionOut)
@inject
def create_prompt_version(
    payload: CreatePromptVersion,
    _: CurrentUser = Depends(require_admin),
    user_id: int = Depends(get_current_user_id),
    service: PromptVersionService = Depends(Provide[Container.prompt_version_service]),
):
    return service.add(payload, user_id)


@router.delete("/{id}", status_code=204)
@inject
def delete_prompt_version(
    id: int,
    _: CurrentUser = Depends(require_admin),
    service: PromptVersionService = Depends(Provide[Container.prompt_version_service]),
):
    service.remove_by_id(id)
    return


@router.post("/activate/{id}", response_model=PromptVersionOut)
@inject
def activate_prompt_version(
    id: int,
    _: CurrentUser = Depends(require_admin),
    user_id: int = Depends(get_current_user_id),
    service: PromptVersionService = Depends(Provide[Container.prompt_version_service]),
):
    return service.activate(id, user_id)


@router.get("", response_model=PromptVersionPageOut)
@inject
def list_prompt_versions(
    prompt_id: int,
    page: int = 1,
    per_page: int = 20,
    service: PromptVersionService = Depends(Provide[Container.prompt_version_service]),
    _: int = Depends(require_admin),
    user_id: int = Depends(get_current_user_id),
):
    return service.list_for_prompt(prompt_id=prompt_id, page=page, per_page=per_page)
