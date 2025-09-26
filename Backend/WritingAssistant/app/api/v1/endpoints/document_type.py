from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Query

from app.core.container import Container
from app.core.dependencies import require_admin
from app.core.security import CurrentUser
from app.services.document_type_service import DocumentTypeService
from app.schema.document_type_schema import (
    CreateDocumentType,
    UpdateDocumentType,
    DocumentTypeOut,
    DocumentTypePageOut,
)

router = APIRouter(prefix="/document-types", tags=["document-types"])


@router.post("", response_model=DocumentTypeOut)
@inject
def create_document_type(
    payload: CreateDocumentType,
    _: CurrentUser = Depends(require_admin),
    service: DocumentTypeService = Depends(Provide[Container.document_type_service]),
):
    return service.add(payload)


@router.get("", response_model=DocumentTypePageOut)
@inject
def list_document_types(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1),
    name: str | None = Query(None),
    ordering: str = Query("-updated_at"),  
    _: CurrentUser = Depends(require_admin),
    service: DocumentTypeService = Depends(Provide[Container.document_type_service]),
):
    return service.list(page=page, per_page=per_page, name=name, ordering=ordering)


@router.get("/{id}", response_model=DocumentTypeOut)
@inject
def get_document_type(
    id: int,
    _: CurrentUser = Depends(require_admin),
    service: DocumentTypeService = Depends(Provide[Container.document_type_service]),
):
    return service.get(id)


@router.patch("/{id}", response_model=DocumentTypeOut)
@inject
def update_document_type(
    id: int,
    payload: UpdateDocumentType,
    _: CurrentUser = Depends(require_admin),
    service: DocumentTypeService = Depends(Provide[Container.document_type_service]),
):
    return service.update(id, payload)


@router.delete("/{id}", status_code=204)
@inject
def delete_document_type(
    id: int,
    _: CurrentUser = Depends(require_admin),
    service: DocumentTypeService = Depends(Provide[Container.document_type_service]),
):
    service.remove(id)
    return
