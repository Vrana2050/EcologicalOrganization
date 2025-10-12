from typing import List

from fastapi import APIRouter, status, Depends
from app.api.dependencies.headers import get_user_headers
from app.api.dependencies.services import get_metadata_service
from app.api.dtos.metadata import (
    CreateMetadataDTO,
    MetadataDTO
)
from app.domain.metadata import MetadataType
from app.infra.mappers.metadata import (
    create_metadata_dto_to_domain,
    metadata_domain_to_dto,
    metadata_dto_to_domain
)

from app.core.exceptions import http_401, http_404, http_400
from app.use_cases.metadata import MetadataService
from app.use_cases.elastic_search_client import maintenance as es_maintenance_service

router = APIRouter(tags=["Metadata"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create(new_metadata: CreateMetadataDTO,
                 user=Depends(get_user_headers),
                 service: MetadataService = Depends(get_metadata_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can create metadata")
    if new_metadata.metadata_type not in [e.value for e in MetadataType]:
        raise http_400("Not a valid metadata type")

    service.create_metadata(create_metadata_dto_to_domain(new_metadata))


@router.get("", response_model=List[MetadataDTO])
async def get_all(user=Depends(get_user_headers),
                  service: MetadataService = Depends(get_metadata_service)):

    # if user.role not in ["MANAGER"]:
    #     raise http_401("Not authorized to view metadata")

    metadata = service.get_all_metadata()
    return [metadata_domain_to_dto(m) for m in metadata] if metadata else []


@router.get("/{metadata_id}", response_model=MetadataDTO)
async def get_by_id(metadata_id: int,
                    user=Depends(get_user_headers),
                    service: MetadataService = Depends(get_metadata_service)):

    if user.role not in ["MANAGER", "EMPLOYEE"]:
        raise http_401("Not authorized to view metadata")

    metadata = service.get_metadata_by_id(metadata_id)
    if not metadata:
        raise http_404("Metadata not found")

    return metadata_domain_to_dto(metadata)


@router.put("", status_code=status.HTTP_200_OK)
async def update(metadata: MetadataDTO,
                 user=Depends(get_user_headers),
                 service: MetadataService = Depends(get_metadata_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can update metadata")

    updated = service.update_metadata(metadata_dto_to_domain(metadata))
    if not updated:
        raise http_404("Metadata not found")

    es_maintenance_service.nullify_metadata(updated.id, updated.metadata_type)


@router.delete("/{metadata_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(metadata_id: int,
                 user=Depends(get_user_headers),
                 service: MetadataService = Depends(get_metadata_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can delete metadata")

    deleted = service.delete_metadata(metadata_id)
    if not deleted:
        raise http_404("Metadata not found")

    es_maintenance_service.delete_metadata(metadata_id)
