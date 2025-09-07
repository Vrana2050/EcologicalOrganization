from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends
from typing import List
from app.schema.session_overview_schema import SessionOverviewOut

from app.core.container import Container
from app.core.dependencies import get_current_user_id
from app.schema.chat_session_schema import CreateChatSession, ChatSessionOut, ChatSessionPageOut, ChatSessionQuery, PatchChatSessionTitle
from app.services.chat_session_service import ChatSessionService
from app.services.session_section_service import SessionSectionService
from app.core.middleware import inject  

router = APIRouter(prefix="/chat-session")

@router.post("", response_model=ChatSessionOut)
@inject
def create_chat_session(
    payload: CreateChatSession,
    service: ChatSessionService = Depends(Provide[Container.chat_session_service]),
    user_id: int = Depends(get_current_user_id),
):
    
    payload.created_by = user_id
    return service.add(payload)


@router.get("", response_model=ChatSessionPageOut)
@inject
def list_chat_session(
    page: int = 1,
    per_page: int = 20,
    service: ChatSessionService = Depends(Provide[Container.chat_session_service]),
    user_id: int = Depends(get_current_user_id),
):
    return service.list(page=page, per_page=per_page, user_id=user_id)


@router.get("/{session_id}/overview", response_model=SessionOverviewOut)
@inject
def list_sections_with_latest_iteration(
    session_id: int,
    user_id: int = Depends(get_current_user_id),
    service: SessionSectionService = Depends(Provide[Container.session_section_service]),
):
    return service.list_with_latest_for_session(session_id, user_id)


@router.patch("/{chat_session_id}/title", response_model=ChatSessionOut)
@inject
def patch_chat_session_title(
    chat_session_id: int,
    payload: PatchChatSessionTitle,
    user_id: int = Depends(get_current_user_id),
    service: ChatSessionService = Depends(Provide[Container.chat_session_service]),
):
    return service.update_title(chat_session_id, payload.title, user_id)

@router.delete("/{chat_session_id}", status_code=204)
@inject
def delete_chat_session(
    chat_session_id: int,
    user_id: int = Depends(get_current_user_id),
    service: ChatSessionService = Depends(Provide[Container.chat_session_service]),
):
    service.remove_by_id(chat_session_id, user_id)
    return