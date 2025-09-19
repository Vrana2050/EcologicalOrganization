from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.dependencies import get_current_user_id
from app.schema.session_section_schema import CreateSessionSection, SessionSectionOut, PatchSessionSectionTitle
from app.services.session_section_service import SessionSectionService
from app.services.section_iteration_service import SectionIterationService
from app.schema.section_iteration_schema import SectionIterationOut, GenerateIterationIn
from app.core.security import CurrentUser
from app.core.dependencies import get_current_user, get_current_user_id

router = APIRouter(prefix="/session-section", tags=["session-sections"])


@router.post("", response_model=SessionSectionOut)
@inject
def create_session_section(
    payload: CreateSessionSection,
    service: SessionSectionService = Depends(Provide[Container.session_section_service]),
):
    return service.add(payload)


@router.delete("/{id}", status_code=204)
@inject
def delete_session_section(
    id: int,
    user_id: int = Depends(get_current_user_id),
    service: SessionSectionService = Depends(Provide[Container.session_section_service]),
):
    service.remove_by_id(id, user_id)
    return



@router.get("/{section_id}/iterations/{seq_no}", response_model=SectionIterationOut)
@inject
def iteration_by_seq(
    section_id: int,
    seq_no: int,
    user_id: int = Depends(get_current_user_id),
    service: SectionIterationService = Depends(Provide[Container.section_iteration_service]),
):
    return service.get_by_seq(section_id, seq_no, user_id)


@router.post("/{section_id}/iterations", response_model=SectionIterationOut)
@inject
def generate_iteration(
    section_id: int,
    payload: GenerateIterationIn,
    user: CurrentUser = Depends(get_current_user),          
    user_id: int = Depends(get_current_user_id),
    service: SectionIterationService = Depends(Provide[Container.section_iteration_service]),
):
    return service.generate(section_id, payload, user_id, user)


@router.patch("/{session_section_id}/title", response_model=SessionSectionOut)
@inject
def patch_chat_session_title(
    session_section_id: int,
    payload: PatchSessionSectionTitle,
    user_id: int = Depends(get_current_user_id),
    service: SessionSectionService = Depends(Provide[Container.session_section_service]),
):
    return service.update_title(session_section_id, payload.name, user_id)