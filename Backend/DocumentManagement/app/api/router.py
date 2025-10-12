from fastapi import APIRouter
from .routes.documents.directory import router as directory_router
from .routes.documents.user_groups import router as user_group_router
from .routes.documents.document import router as document_router
from .routes.documents.tags import router as tags_router
from .routes.documents.metadata import router as metadata_router
from .routes.documents.permissions import router as permission_router
from .routes.documents.search import router as search_router

router = APIRouter()

router.include_router(directory_router, prefix="/directory")
router.include_router(user_group_router, prefix="/user_group")
router.include_router(document_router, prefix="/document")
router.include_router(tags_router, prefix="/tag")
router.include_router(metadata_router, prefix="/metadata")
router.include_router(permission_router, prefix="/permission")
router.include_router(search_router, prefix="/search")