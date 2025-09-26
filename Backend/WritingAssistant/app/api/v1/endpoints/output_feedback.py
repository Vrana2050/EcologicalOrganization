from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Query

from app.core.container import Container
from app.core.dependencies import get_current_user, CurrentUser
from app.schema.output_feedback_schema import (
    CreateOutputFeedback,
    OutputFeedbackOut,
    OutputFeedbackPage,
    OutputFeedbackItemOut,
)
from app.services.output_feedback_service import OutputFeedbackService

router = APIRouter(prefix="/output-feedback", tags=["output-feedback"])


@router.post("", response_model=OutputFeedbackOut)
@inject
def create_output_feedback(
    payload: CreateOutputFeedback,
    user: CurrentUser = Depends(get_current_user),
    service: OutputFeedbackService = Depends(Provide[Container.output_feedback_service]),
):

    return service.add(payload, user_id=user.id, user_email=user.email)


@router.get("/by-prompt/{prompt_id}", response_model=OutputFeedbackPage)
@inject
def list_feedback_for_prompt(
    prompt_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(5, ge=1, le=100),
    service: OutputFeedbackService = Depends(Provide[Container.output_feedback_service]),
):
    return service.list_for_prompt(prompt_id, page=page, per_page=per_page)


@router.get("/by-version/{version_id}", response_model=OutputFeedbackPage)
@inject
def list_feedback_for_version(
    version_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(5, ge=1, le=100),
    service: OutputFeedbackService = Depends(Provide[Container.output_feedback_service]),
):
    return service.list_for_version(version_id, page=page, per_page=per_page)


@router.get("/{feedback_id}", response_model=OutputFeedbackItemOut)
@inject
def get_feedback_details(
    feedback_id: int,
    service: OutputFeedbackService = Depends(Provide[Container.output_feedback_service]),
):
    return service.get_feedback_details(feedback_id)
