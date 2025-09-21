from typing import List

from app.core.exceptions import *
from app.domain.directory import Directory
from app.domain.document import Document
from app.domain.permissions import AccessType
from app.infra.mappers.permissions import *
from app.infra.repo.permissions import PermissionRepository, PermissionValueRepository
from app.use_cases.user_group import UserGroupService


class PermissionValueService:
    def __init__(self, permission_value_repo: PermissionValueRepository):
        self.permission_value_repo = permission_value_repo

    def save(self, permission_value: PermissionValue) -> PermissionValue:
        return self.permission_value_repo.save(permission_value)

    def update(self, permission_value: PermissionValue) -> PermissionValue:
        return self.permission_value_repo.update(permission_value)


class PermissionService:

    def __init__(self, permission_repo: PermissionRepository,
                 permission_value_service: PermissionValueService,
                 user_group_service: UserGroupService):
        self.permission_repo = permission_repo
        self.permission_value_service = permission_value_service
        self.user_group_service = user_group_service

    def get_all_section_permissions(self, user_id: int) -> List[Permission]:
        return self.permission_repo.get_all_section_permissions(user_id)

    def save(self, permission: Permission, permission_value: Optional[PermissionValue] = None) -> Permission:
        if permission_value:
            saved_permission_value = self.permission_value_service.save(permission_value)
            permission.permission_value_id = saved_permission_value.id

        return self.permission_repo.save(permission)

    def update(self, permission: Permission, permission_value: Optional[PermissionValue] = None) -> Permission:
        if permission_value:
            updated_permission_value = self.permission_value_service.update(permission_value)
            permission.permission_value_id = updated_permission_value.id

        return self.permission_repo.update(permission)

    def get_permission_for_document_and_user(self, user_id: int, document_id: int) -> Permission:
        return self.permission_repo.get_permission_for_document_and_user(user_id, document_id)

    def get_permission_for_directory_and_user(self, user_id: int, directory_id: int) -> Permission:
        return self.permission_repo.get_permission_for_directory_and_user(user_id, directory_id)

    def get_permission_for_document_and_group(self, group_id, document_id):
        return self.permission_repo.get_permission_for_document_and_group(group_id, document_id)

    #
    # def save(self, dto: PermissionCreateDTO, creator_id: int) -> None:
    #
    #     if (dto.email and dto.group_id) or (not dto.email and not dto.group_id):
    #         raise http_400("You must provide either email or group_id, but not both")
    #
    #     if dto.email:
    #         # check with gRPC if the user with the given email exist and get the User
    #         pass
    #     if dto.group_id:
    #         pass
    #
    #
    #     #permission, permission_value = dto_to_domain(dto, user_id, principal_type, parent_directory_id)
    def get_all_permission_for_directory(self, directory_id) -> List[Permission]:
        return self.permission_repo.get_all_permissions_for_directory(directory_id)
    #
    # def get_all_permission_for_document(self, document_id) -> List[Permission]:
    #     return self.permission_repo.get_all_permissions_for_document(document_id)

    def has_permission_to_create_directory(self, parent_directory_id: int, user_id: int) -> bool:
        permission = self.permission_repo.get_permission_for_user_directory(user_id, parent_directory_id)
        if permission and permission.permission_value.access_type == AccessType.EDITOR:
            return True
        else:
            for group in self.user_group_service.get_groups_for_user(user_id):
                group_permission = self.permission_repo.get_permission_for_group_directory(group.id, parent_directory_id)
                if group_permission and group_permission.permission_value.access_type == AccessType.EDITOR:
                    return True
                else:
                    continue
        return False

    def has_permission_to_create_document(self, parent_directory_id: int, user_id: int) -> bool:
        permission = self.permission_repo.get_permission_for_user_directory(user_id, parent_directory_id)
        if permission and permission.permission_value.access_type == AccessType.EDITOR:
            return True
        else:
            for group in self.user_group_service.get_groups_for_user(user_id):
                group_permission = self.permission_repo.get_permission_for_group_directory(group.id, parent_directory_id)
                if group_permission and group_permission.permission_value.access_type == AccessType.EDITOR:
                    return True
                else:
                    continue
        return False

    def has_permission_to_share_directory(self, directory_id: int, user_id: int) -> bool:
        permission = self.permission_repo.get_permission_for_user_directory(user_id, directory_id)
        if permission and permission.permission_value.access_type == AccessType.EDITOR:
            return True
        else:
            for group in self.user_group_service.get_groups_for_user(user_id):
                group_permission = self.permission_repo.get_permission_for_group_directory(group.id,
                                                                                           directory_id)
                if group_permission and group_permission.permission_value.access_type == AccessType.EDITOR:
                    return True
                else:
                    continue
        return False

    def has_permission_to_share_document(self, document_id: int, user_id: int) -> bool:
        permission = self.permission_repo.get_permission_for_user_document(user_id, document_id)
        if permission and permission.permission_value.access_type == AccessType.EDITOR:
            return True
        else:
            for group in self.user_group_service.get_groups_for_user(user_id):
                group_permission = self.permission_repo.get_permission_for_group_directory(group.id,
                                                                                           document_id)
                if group_permission and group_permission.permission_value.access_type == AccessType.EDITOR:
                    return True
                else:
                    continue
        return False




