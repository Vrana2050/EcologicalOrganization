from fastapi import APIRouter

from app.api.v1.endpoints.chat_session import router as chat_session_router
from app.api.v1.endpoints.session_section import router as session_section_router


routers = APIRouter()
router_list = [chat_session_router, session_section_router]

for router in router_list:
    router.tags = routers.tags.append("v1")
    routers.include_router(router)
