from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.dependencies import get_current_user_id
from app.schema.session_section_schema import CreateSessionSection, SessionSectionOut
from app.services.session_section_service import SessionSectionService
from app.services.section_iteration_service import SectionIterationService
from app.schema.session_iteration_schema import SectionIterationOut

router = APIRouter(prefix="/session-section")


@router.post("", response_model=SessionSectionOut)
@inject
def create_session_section(
    payload: CreateSessionSection,
    service: SessionSectionService = Depends(Provide[Container.session_section_service]),
):
    return service.add(payload)


@router.delete("/{id}", response_model=SessionSectionOut)
@inject
def delete_session_section(
    id: int,
    user_id: int = Depends(get_current_user_id),
    service: SessionSectionService = Depends(Provide[Container.session_section_service]),
):
    return service.remove_by_id(id, user_id)


@router.get("/{section_id}/iterations/{seq_no}", response_model=SectionIterationOut)
@inject
def iteration_by_seq(
    section_id: int,
    seq_no: int,
    user_id: int = Depends(get_current_user_id),
    service: SectionIterationService = Depends(Provide[Container.section_iteration_service]),
):
    return service.get_by_seq(section_id, seq_no, user_id)