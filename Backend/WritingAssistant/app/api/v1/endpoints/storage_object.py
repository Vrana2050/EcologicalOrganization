from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from typing import Optional

from app.core.container import Container
from app.core.dependencies import get_current_user_id, require_admin
from app.core.security import CurrentUser
from app.services.storage_object_service import StorageObjectService
from app.schema.storage_object_schema import StorageObjectOut, StorageObjectPageOut, PatchStorageObject

router = APIRouter(prefix="/storage-objects", tags=["storage-objects"])


@router.get("", response_model=StorageObjectPageOut)
@inject
def list_storage_objects(
    page: int = 1,
    per_page: int = 20,
    repo_folder_id: Optional[int] = None,
    service: StorageObjectService = Depends(Provide[Container.storage_object_service]),
    _: CurrentUser = Depends(require_admin),
):
    return service.list(page=page, per_page=per_page, repo_folder_id=repo_folder_id)


@router.get("/{object_id}", response_model=StorageObjectOut)
@inject
def get_storage_object(
    object_id: int,
    service: StorageObjectService = Depends(Provide[Container.storage_object_service]),
    _: CurrentUser = Depends(require_admin),
):
    return service.get(object_id)


@router.post("", response_model=StorageObjectOut, status_code=status.HTTP_201_CREATED)
@inject
async def create_storage_object(
    file: UploadFile = File(...),
    repo_folder_id: Optional[int] = Form(None),
    user_id: int = Depends(get_current_user_id),
    document_type_id: int = Form(...),
    service: StorageObjectService = Depends(Provide[Container.storage_object_service]),
    _: CurrentUser = Depends(require_admin),
):
    content = await file.read()
    return service.add_from_upload(
        filename=file.filename or "upload.bin",
        content=content,
        mime_type=file.content_type,
        repo_folder_id=repo_folder_id,
        created_by=user_id,
        document_type_id=document_type_id
    )


@router.patch("/{object_id}", response_model=StorageObjectOut)
@inject
def patch_storage_object(
    object_id: int,
    payload: PatchStorageObject,
    service: StorageObjectService = Depends(Provide[Container.storage_object_service]),
    _: CurrentUser = Depends(require_admin),
):
    return service.update_meta(object_id, payload)


@router.delete("/{object_id}", status_code=204)
@inject
def delete_storage_object(
    object_id: int,
    service: StorageObjectService = Depends(Provide[Container.storage_object_service]),
    _: CurrentUser = Depends(require_admin),
):
    service.remove(object_id)
    return
