from http.client import HTTPException

from fastapi import APIRouter, status, Depends
from app.api.dependencies.headers import get_user_headers
from app.api.dtos.permissions import PermissionCreateDTO
from app.core.exceptions import http_400
from app.use_cases.directory import DirectoryService
from app.api.dependencies.services import get_directory_service, get_document_service
from app.use_cases.document import DocumentService

router = APIRouter(tags=["Permissions"])


@router.post('/share', status_code=status.HTTP_201_CREATED)
async def share_resource(new_permission: PermissionCreateDTO,
        user=Depends(get_user_headers),
        directory_service: DirectoryService = Depends(get_directory_service),
        document_service: DocumentService = Depends(get_document_service)):

    if new_permission.directory_id is not None:
        directory_service.share_directory(new_permission, user.id)
    elif new_permission.document_id is not None:
        document_service.share_document(new_permission, user.id)
    else:
        raise http_400("No document or directory to share")



@router.post('/manager-create-permissions/{manager_id}', status_code=status.HTTP_201_CREATED)
async def give_new_manager_permission(manager_id: int,
                                      service: DirectoryService = Depends(get_directory_service)):
    pass

