from fastapi import APIRouter, status, Depends
from app.api.dependencies.headers import get_user_headers
from app.api.dtos.user_group import UserGroupCreateDTO
from app.api.dependencies.services import get_user_group_service
from app.core.exceptions import http_401
from app.domain.user_group import UserGroup
from app.use_cases.user_group import UserGroupService

router = APIRouter(tags=["User Groups"])


@router.get('/', status_code=status.HTTP_200_OK)
async def get_all_groups(user=Depends(get_user_headers),
                        user_group_service: UserGroupService = Depends(get_user_group_service)):
    if user.role != "MANAGER":
        raise http_401("Only managers can handle user groups")

    return user_group_service.get_all_user_groups()


@router.get('/{group_id}', status_code=status.HTTP_200_OK)
async def get_user_group_by_id(group_id: int,
                        user=Depends(get_user_headers),
                        user_group_service: UserGroupService = Depends(get_user_group_service)):
    if user.role != "MANAGER":
        raise http_401("Only managers can handle user groups")

    return user_group_service.get_group_with_user_emails(group_id)

@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_user_group(new_user_group: UserGroupCreateDTO,
        user=Depends(get_user_headers),
        user_group_service: UserGroupService = Depends(get_user_group_service)):
    if user.role != "MANAGER":
        raise http_401("Only managers can create user groups")

    return user_group_service.create_user_group(UserGroup(name=new_user_group.name, description=new_user_group.description))


@router.get('/add_member/{user_group_id}/{user_email}', status_code=status.HTTP_200_OK)
async def add_member_to_user_group(user_email: str,
                                   user_group_id: int,
                                   user=Depends(get_user_headers),
                                   user_group_service: UserGroupService = Depends(get_user_group_service)):
    if user.role != "MANAGER":
        raise http_401("Only managers can handle user groups")

    return user_group_service.add_member(user_group_id, user_email)


@router.delete('/remove_member/{group_id}/{member_id}', status_code=status.HTTP_204_NO_CONTENT)
async def add_member_to_user_group(group_id: int,
                                   member_id: int,
                                   user=Depends(get_user_headers),
                                   user_group_service: UserGroupService = Depends(get_user_group_service)):
    if user.role != "MANAGER":
        raise http_401("Only managers can handle user groups")

    user_group_service.remove_member(group_id, member_id)

@router.delete('/{group_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_group(group_id: int,
                            user=Depends(get_user_headers),
                            user_group_service: UserGroupService = Depends(get_user_group_service)):
    if user.role != "MANAGER":
        raise http_401("Only managers can handle user groups")
    user_group_service.delete_group(group_id)
