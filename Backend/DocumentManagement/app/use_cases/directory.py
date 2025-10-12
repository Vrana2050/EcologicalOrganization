from typing import List

from app.core.exceptions import *
from app.infra.repo.directory import DirectoryRepository
from app.infra.mappers.directory import *
from app.domain.directory import Directory
from app.use_cases.permissions import PermissionService
from .auth import get_all_managers, get_user_by_id
from .elastic_search_client.directories import DirectoryCreateDTO, DirectoryDeleteDTO
from ..api.dtos.directory import SectionsReadDTO, SectionReadDTO, DirectoryInfoDTO
from ..api.dtos.permissions import PermissionCreateDTO
from ..domain.permissions import Permission, AccessOrigin, PrincipalType, PermissionValue, AccessType
from ..infra.additional_schemas import DirectoryOpenResponse, map_subdirectory_with_tags, map_subdocument_with_tags
from ..infra.mappers.document_open import CustomMetadataDTO, PathItem
from .elastic_search_client import directories as es_directory_service

class DirectoryService:

    def __init__(self, directory_repo: DirectoryRepository,
                 permission_service: PermissionService):
        self.directory_repo = directory_repo
        self.permission_service = permission_service

    def get_directory_by_id(self, id: int) -> Directory:
        return self.directory_repo.get_by_id(id)

    def get_sections_for_user(self, user_id: int) -> SectionsReadDTO:

        sections: List[SectionReadDTO] = []

        activity_report_dir_id = self.get_activity_report_directory_id()

        for permission in self.permission_service.get_all_section_permissions(user_id):
            if permission.directory_id == activity_report_dir_id:
                continue  # preskoči ovu sekciju

            sections.append(SectionReadDTO(
                directory_id=permission.directory_id,
                principal_type=permission.principal_type,
                directory_name=self.get_directory_by_id(permission.directory_id).name,
                access_type=permission.permission_value.access_type
            ))

        return SectionsReadDTO(sections=sections)


    def get_activity_report_directory_id(self) -> int:
        return self.directory_repo.get_activity_report_directory_id()


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
        if directory.parent_directory_id:
            if self.directory_repo.get_by_id(directory.parent_directory_id) is None:
                raise http_404(f"Parent directory with id {directory.parent_directory_id} doesn't exist")

            if not self.permission_service.has_permission_to_create_directory(directory.parent_directory_id, directory.creator_id):
                raise http_403("You are not allowed to create this directory")

            if self.directory_repo.get_by_name_in_directory(directory.name, directory.parent_directory_id):
                raise http_409(f"Directory named '{directory.name}' already exists on this level")

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


        es_directory_service.create_directory(DirectoryCreateDTO(id=directory.id,
                                                                 name=directory.name,
                                                                 parent_directory_id=directory.parent_directory_id,
                                                                 creator_id=directory.creator_id,
                                                                 created_at=directory.created_at,
                                                                 ))

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

    def open_directory_for_user(self, directory_id: int, user_id: int) -> DirectoryOpenResponse:
        current_directory = self.directory_repo.get_by_id(directory_id)
        if current_directory is None:
            raise http_404(f"Directory with id '{directory_id}' doesn't exist")

        subdirectories = self.directory_repo.get_subdirectories(directory_id, user_id)
        subdirectories_with_tags = []
        for subdirectory in subdirectories:
            tags = self.directory_repo.get_tags_for_directory(subdirectory.directory_id)
            subdirectories_with_tags.append(map_subdirectory_with_tags(subdirectory, tags))

        subdocuments = self.directory_repo.get_subdocuments(directory_id, user_id)
        subdocuments_with_tags = []
        for subdocument in subdocuments:
            tags = self.directory_repo.get_tags_for_document(subdocument.document_id)
            subdocuments_with_tags.append(map_subdocument_with_tags(subdocument, tags))
        current_permission = self.permission_service.get_highest_permission_for_directory(directory_id, user_id)

        path = [{"id": current_directory.id, "name": current_directory.name}]
        next_directory = self.directory_repo.get_by_id(current_directory.parent_directory_id)

        while next_directory and self.permission_service.has_permission_for_directory(next_directory.id, user_id):
            path.append({"id": next_directory.id, "name": next_directory.name})
            if next_directory.parent_directory_id:
                next_directory = self.directory_repo.get_by_id(next_directory.parent_directory_id)
            else:
                next_directory = None

        if next_directory:
            shared = self.directory_repo.get_shared_directory(user_id)
            path.append({"id": shared.id, "name": shared.name})

        path.reverse()

        return DirectoryOpenResponse(
            current_permission=current_permission,
            subdirectories=subdirectories_with_tags,
            subdocuments=subdocuments_with_tags,
            path=path
        )

    def get_by_id(self, directory_id):
        return self.directory_repo.get_by_id(directory_id)

    def get_shared_directory(self, user_id):
        return self.directory_repo.get_shared_directory(user_id)

    def get_directory_info(self, directory_id, user_id):
         user_permission =  self.permission_service.get_highest_permission_for_directory(directory_id, user_id)

         if user_permission and user_permission.access_type != AccessType.EDITOR:
             raise http_403("You do not have permission to delete this document.")

         directory = self.directory_repo.get_by_id(directory_id)
         if directory is None:
             raise http_404(f"Directory with id '{directory_id}' doesn't exist")

         creator = get_user_by_id(directory.creator_id)

         path: list[PathItem] = []
         path.append(PathItem(id=directory.id, name=directory.name))
         next_directory = self.directory_repo.get_by_id(directory.parent_directory_id)

         while next_directory and self.permission_service.has_permission_for_directory(next_directory.id, user_id):
             path.append(PathItem(id=next_directory.id, name=next_directory.name))
             if next_directory.parent_directory_id:
                 next_directory = self.directory_repo.get_by_id(next_directory.parent_directory_id)
             else:
                 next_directory = None

         if next_directory:
             shared = self.directory_repo.get_shared_directory(user_id)
             path.append(PathItem(id=shared.id, name=shared.name))

         path.reverse()

         return DirectoryInfoDTO(
             directory_id=directory.id,
             directory_name=directory.name,
             created_at=directory.created_at,
             creator=creator.email,
             parent_directory_id=directory.parent_directory_id,
             last_modified=directory.last_modified,
             tags=directory.tags,
             custom_metadata_values=[
                CustomMetadataDTO(
                    id=mv.id,
                    value=mv.get_typed_value(),
                    is_missing_value=mv.is_missing_value,
                    custom_metadata={
                        "id": mv.custom_metadata.id,
                        "name": mv.custom_metadata.name,
                        "metadata_type": mv.custom_metadata.metadata_type,
                        "description": mv.custom_metadata.description,
                    } if mv.custom_metadata else None
                )
                for mv in directory.custom_metadata_values
            ],
             path=path
         )

    def rename_directory(self, directory_id, directory_name):
        return self.directory_repo.rename_directory(directory_id, directory_name)

    def delete_directory(self, directory_id, user_id):
        permission = self.permission_service.get_highest_permission_for_directory(directory_id, user_id)
        if permission is None:
            raise http_403("You do not have permission to delete this directory.")

        directory = self.directory_repo.get_by_id(directory_id)
        if permission.access_type != AccessType.EDITOR:
            raise http_403("You do not have permission to delete this directory.")

        if not directory.parent_directory_id and directory.creator_id != user_id:
            raise http_403("You do not have permission to delete this directory.")

        dir_ids_to_delete: list[int] = self.directory_repo.delete(directory_id)
        if dir_ids_to_delete:
            es_directory_service.delete_directories(DirectoryDeleteDTO(directory_ids=dir_ids_to_delete))

    def get_directory_ids_by_name(self, directory_name) -> list[int]:
        return self.directory_repo.get_directory_ids_by_name(directory_name)

    def get_audit_log_reports(self) -> int:
        return self.directory_repo.get_audit_log_reports()




