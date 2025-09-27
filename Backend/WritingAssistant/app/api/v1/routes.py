from fastapi import APIRouter

from app.api.v1.endpoints.chat_session import router as chat_session_router
from app.api.v1.endpoints.session_section import router as session_section_router
from app.api.v1.endpoints.prompt import router as prompt_router
from app.api.v1.endpoints.prompt_version import router as prompt_version_router
from app.api.v1.endpoints.template import router as template_router
from app.api.v1.endpoints.document_type import router as document_type_router
from app.api.v1.endpoints.output_feedback import router as output_feedback_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.report import router as report_router
from app.api.v1.endpoints.storage_object import router as storage_object_router
from app.api.v1.endpoints.repo_folder import router as repo_folder_router


routers = APIRouter()
router_list = [chat_session_router, session_section_router, prompt_router, prompt_version_router, template_router, document_type_router, output_feedback_router, analytics_router, report_router, storage_object_router, repo_folder_router]

for router in router_list:
    router.tags = ["v1"]
    routers.include_router(router)
