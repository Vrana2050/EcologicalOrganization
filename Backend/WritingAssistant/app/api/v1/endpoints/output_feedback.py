from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.dependencies import get_current_user_id
from app.schema.output_feedback_schema import CreateOutputFeedback, OutputFeedbackOut
from app.services.output_feedback_service import OutputFeedbackService

router = APIRouter(prefix="/output-feedback", tags=["output-feedback"])

@router.post("", response_model=OutputFeedbackOut)
@inject
def create_output_feedback(
    payload: CreateOutputFeedback,
    user_id: int = Depends(get_current_user_id),
    service: OutputFeedbackService = Depends(Provide[Container.output_feedback_service]),
):
    return service.add(payload, user_id)
