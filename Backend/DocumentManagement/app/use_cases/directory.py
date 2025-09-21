from typing import List

from app.core.exceptions import *
from app.infra.repo.directory import DirectoryRepository
from app.infra.mappers.directory import *
from app.domain.directory import Directory
from app.use_cases.permissions import PermissionService
from .auth import get_all_managers
from ..api.dtos.directory import SectionsReadDTO, SectionReadDTO
from ..api.dtos.permissions import PermissionCreateDTO
from ..domain.permissions import Permission, AccessOrigin, PrincipalType, PermissionValue, AccessType


class DirectoryService:

    def __init__(self, directory_repo: DirectoryRepository,
                 permission_service: PermissionService):
        self.directory_repo = directory_repo
        self.permission_service = permission_service

    def get_directory_by_id(self, id: int) -> Directory:
        return self.directory_repo.get_by_id(id)

    def get_sections_for_user(self, user_id: int) -> SectionsReadDTO:

        sections: List[SectionReadDTO] = []

        [sections.append(SectionReadDTO(
            directory_id=permission.directory_id,
            principal_type=permission.principal_type,
            directory_name=self.get_directory_by_id(permission.directory_id).name,
            access_type=permission.permission_value.access_type
        )) for permission in self.permission_service.get_all_section_permissions(user_id)]

        return SectionsReadDTO(sections=sections)


    def create_shared_for_employee(self, employee_id: int) -> None:

        if self.directory_repo.get_shared_directory(employee_id):
            raise http_400("Shared directory already exists")

        shared_directory = self.directory_repo.create_shared_for_employee(employee_id)
        self.permission_service.save(
            Permission(id=None, access_origin=AccessOrigin.DIRECT,
                       principal_type=PrincipalType.EMPLOYEE,
                       user_id=employee_id, directory_id=shared_directory.id,
                       parent_directory_id=None,
                       group_id=None, document_id=None,
                       permission_value_id=None),
            PermissionValue(id=None,
                            access_type=AccessType.VIEWER,
                            expires_at=None))


    def save(self, dto: CreateDirectoryDTO, creator_id: int) -> Directory:

        directory = dto_to_domain(dto, creator_id)

        if directory.parent_directory_id and self.directory_repo.get_by_id(directory.parent_directory_id) is None:
            raise http_404(f"Parent directory with id {directory.parent_directory_id} doesn't exist")

        if not self.permission_service.has_permission_to_create_directory(directory.parent_directory_id, directory.creator_id):
            raise http_403("You are not allowed to create this directory")

        if self.directory_repo.get_by_name_in_directory(directory.name, directory.parent_directory_id):
            raise http_409(f"Directory named '{directory.name}' already exists on this level")

        directory = self.directory_repo.save(directory)

        if directory.is_section():
            self.give_permissions_to_managers(directory)
        else:
            for permission in self.permission_service.get_all_permission_for_directory(directory.parent_directory_id):
                self.permission_service.save(Permission(id=None, access_origin=AccessOrigin.INHERITED,
                           principal_type=permission.principal_type,
                           user_id=permission.user_id if permission.user_id else None,
                           directory_id=directory.id,
                           parent_directory_id=permission.directory_id,
                           group_id=permission.group_id if permission.group_id else None,
                           document_id=None,
                           permission_value_id=permission.permission_value_id))

        return directory



    def give_permissions_to_managers(self, directory: Directory) -> None:
        for manager_id in get_all_managers():
            self.permission_service.save(
                Permission(id=None, access_origin=AccessOrigin.DIRECT,
                           principal_type=PrincipalType.OWNER if manager_id == directory.creator_id else PrincipalType.MANAGER,
                           user_id=manager_id, directory_id=directory.id,
                           parent_directory_id=None,
                           group_id=None, document_id=None,
                           permission_value_id=None),
                PermissionValue(id=None,
                                access_type=AccessType.EDITOR if manager_id == directory.creator_id else AccessType.VIEWER,
                                expires_at=None))


    def share_directory(self, new_permission: PermissionCreateDTO, sharer_id: int):
        pass


    def get_shared_directory_for_user(self, user_id: int) -> Directory:
        return self.directory_repo.get_shared_directory(user_id)



