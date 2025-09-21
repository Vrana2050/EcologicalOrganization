from fastapi import APIRouter, status, Depends
from app.api.dependencies.headers import get_user_headers
from app.api.dtos.directory import CreateDirectoryDTO, SectionsReadDTO
from app.core.exceptions import http_403
from app.use_cases.directory import DirectoryService
from app.api.dependencies.services import get_directory_service

router = APIRouter(tags=["Directory"])


@router.get('/', status_code=status.HTTP_200_OK)
async def get_directory():
    pass

@router.get('/sections', status_code=status.HTTP_200_OK, response_model=SectionsReadDTO)
async def get_user_sections(user=Depends(get_user_headers),
        directory_service: DirectoryService = Depends(get_directory_service)):

    return directory_service.get_sections_for_user(user.id)

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

