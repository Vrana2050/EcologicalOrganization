from cx_Oracle import SessionPool
from fastapi import APIRouter, status, Depends
from sqlalchemy.orm.session import Session

from app.api.dependencies.headers import get_user_headers
from app.api.dtos.directory import CreateDirectoryDTO, SectionsReadDTO, DirectoryUpdateDTO, DirectoryInfoDTO
from app.core.exceptions import http_403, http_401
from app.infra.additional_schemas import SubdirectorySchema, DirectoryOpenResponse
from app.infra.database import get_db
from app.use_cases.directory import DirectoryService
from app.api.dependencies.services import get_directory_service, get_document_service
from typing import List

from app.use_cases.document import DocumentService

router = APIRouter(tags=["Directory"])


@router.get('/sections', status_code=status.HTTP_200_OK, response_model=SectionsReadDTO)
async def get_user_sections(user=Depends(get_user_headers),
        directory_service: DirectoryService = Depends(get_directory_service)):

    return directory_service.get_sections_for_user(user.id)

@router.get('/{directory_id}', status_code=status.HTTP_200_OK, response_model=DirectoryOpenResponse)
async def get_directory(directory_id: int,
                        user=Depends(get_user_headers),
                        service: DirectoryService = Depends(get_directory_service)):
    return service.open_directory_for_user(directory_id, user.id)


@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_directory(new_directory: CreateDirectoryDTO,
        user=Depends(get_user_headers),
        service: DirectoryService = Depends(get_directory_service)):

    if not new_directory.parent_directory_id and user.role != 'MANAGER':
        raise http_403("Only managers can create sections")

    return service.save(new_directory, user.id)


@router.get('/create-shared/{employee_id}', status_code=status.HTTP_201_CREATED)
async def create_shared_directory(employee_id: int,
                                  service: DirectoryService = Depends(get_directory_service)):
    service.create_shared_for_employee(employee_id)

@router.put('', status_code=status.HTTP_204_NO_CONTENT)
async def update_directory(updated_directory: DirectoryUpdateDTO,
                           user=Depends(get_user_headers),
                           db: Session = Depends(get_db),
                           service: DocumentService = Depends(get_document_service)):

    try:
        service.update_directory(updated_directory, user.id)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

@router.get('/info/{directory_id}', status_code=status.HTTP_200_OK, response_model=DirectoryInfoDTO)
async def get_directory(directory_id: int,
                        user=Depends(get_user_headers),
                        service: DirectoryService = Depends(get_directory_service)):
    return service.get_directory_info(directory_id, user.id)

@router.delete('/{directory_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_directory(directory_id: int,
                           user=Depends(get_user_headers),
                           service: DirectoryService = Depends(get_directory_service)):
    service.delete_directory(directory_id, user.id)


@router.get('/section/activity-report', status_code=status.HTTP_200_OK)
async def generate_report(user=Depends(get_user_headers),
                          service: DirectoryService = Depends(get_directory_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can update metadata")

    return {"directory_id": service.get_activity_report_directory_id()}

