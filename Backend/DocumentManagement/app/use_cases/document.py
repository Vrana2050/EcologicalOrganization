from datetime import datetime, UTC

from app.api.dtos.documents import DocumentCreateDTO
from app.api.dtos.permissions import PermissionCreateDTO
from app.constants import ALLOWED_DOCUMENT_FORMATS, MAX_FILE_SIZE
from app.core.exceptions import http_400, http_404, http_403
from app.domain.directory import Directory, DirectoryType
from app.domain.document import DocumentFile, Document, DocumentStatus
from app.domain.permissions import Permission, AccessOrigin, PrincipalType, AccessType
from app.domain.retention import RetentionType
from app.infra.repo.document import DocumentRepository
import os

from app.use_cases.directory import DirectoryService
from app.use_cases.permissions import PermissionService
from app.use_cases.user_group import UserGroupService
from .auth import get_user_by_email
from ..infra.mappers.permissions import permission_create_dto_to_domain


class DocumentService:
    def __init__(self, document_repo: DocumentRepository,
                 directory_service: DirectoryService,
                 permission_service: PermissionService,
                 group_service: UserGroupService):
        self.document_repo = document_repo
        self.directory_service = directory_service
        self.permission_service = permission_service
        self.group_service = group_service

    def save(self, dto: DocumentCreateDTO, user_id) -> None:

        parent = self.directory_service.get_directory_by_id(dto.parent_directory_id)
        if not parent or parent.directory_type == DirectoryType.SYSTEM:
            raise http_404('Directory not found.')

        if not self.permission_service.has_permission_to_create_document(dto.parent_directory_id, user_id):
            raise http_403("You are not allowed to create this document")

        file_extension = os.path.splitext(dto.uploaded_file.filename)[1].lower()

        if file_extension not in ALLOWED_DOCUMENT_FORMATS:
            raise http_400(f"File type '{file_extension}' is not allowed.")

        dto.uploaded_file.file.seek(0, os.SEEK_END)
        file_size = dto.uploaded_file.file.tell()
        dto.uploaded_file.file.seek(0)

        if file_size > MAX_FILE_SIZE:
            raise http_400(f"File size exceeds the maximum limit of {MAX_FILE_SIZE / (1024 * 1024)} MB.")

        if not dto.uploaded_file.filename or len(dto.uploaded_file.filename) > 255:
            raise http_400("Invalid file name.")

        utc_now = datetime.now(UTC)

        saved_document = self.document_repo.save(Document(id=None,
                                         parent_directory_id=dto.parent_directory_id,
                                         creator_id=user_id,
                                         retention_id=None,
                                         retention_type=RetentionType.INHERITED,
                                         retention_expires=None,
                                         created_at=utc_now,
                                         active_version=1,
                                         last_modified=utc_now,
                                         name=dto.uploaded_file.filename,
                                         status=DocumentStatus.ACTIVE,
                                         ),
                                DocumentFile(document_id=None,
                                             file_size=file_size,
                                             file_type=file_extension,
                                             uploader_id=user_id,
                                             version=1,
                                             uploaded_at=utc_now,
                                             physical_path="",
                                             file_name=dto.uploaded_file.filename,
                                             summary=""))

        document_file = saved_document.document_files[0]
        physical_path = document_file.physical_path

        with open(physical_path, "wb") as f:

            dto.uploaded_file.file.seek(0)
            f.write(dto.uploaded_file.file.read())

        for permission in self.permission_service.get_all_permission_for_directory(saved_document.parent_directory_id):
            self.permission_service.save(Permission(id=None, access_origin=AccessOrigin.INHERITED,
                       principal_type=permission.principal_type,
                       user_id=permission.user_id if permission.user_id else None,
                       directory_id=None,
                       parent_directory_id=permission.directory_id,
                       group_id=permission.group_id if permission.group_id else None,
                       document_id=saved_document.id,
                       permission_value_id=permission.permission_value_id))


    def share_document(self, new_permission: PermissionCreateDTO, sharer_id: int):
        # da li sme da sharuje
        if not self.permission_service.has_permission_to_share_document(new_permission.document_id, sharer_id):
            raise http_403("You are not allowed to share this document")
        sharer_permission = self.permission_service.get_permission_for_document_and_user(new_permission.document_id, sharer_id)
        document = self.document_repo.get_by_id(new_permission.document_id)
        if not document:
            raise http_404("Document not found.")
        # da li je validna grupa/ email
        if new_permission.group_name is not None:
            group = self.group_service.get_user_group_by_name(new_permission.group_name)
            if  group is None:
                raise http_404(f"User group '{new_permission.group_name}' not found.")
            else:
                existing_permission = self.permission_service.get_permission_for_document_and_group(group.id, new_permission.document_id)
                if existing_permission:
                    if existing_permission.permission_value.access_type == AccessType.EDITOR and sharer_permission.principal_type != PrincipalType.OWNER:
                        raise http_403("You are not allowed to change editor's permission")

                    updated_permission, updated_permission_value = permission_create_dto_to_domain(new_permission,
                                                                                                   group_id=existing_permission.group_id,
                                                                                                   principal_type=existing_permission.principal_type,
                                                                                                   parent_directory_id=existing_permission.parent_directory_id)
                    updated_permission_value.id = existing_permission.permission_value_id
                    updated_permission.id = existing_permission.id
                    updated_permission.permission_value_id = existing_permission.permission_value_id

                    self.permission_service.update(updated_permission, updated_permission_value)
                else:
                    self.permission_service.save(*permission_create_dto_to_domain(new_permission,
                                                                                  group_id=group.id,
                                                                                  principal_type=PrincipalType.GROUP,
                                                                                  parent_directory_id=document.parent_directory_id))

        else:
            # sacuvaj za usera
            user = get_user_by_email(new_permission.email)

            existing_permission = self.permission_service.get_permission_for_document_and_user(user.id, new_permission.document_id)
            if existing_permission:
                if existing_permission.principal_type == PrincipalType.OWNER:
                    raise http_403("You are not allowed to change owner's permission")
                if existing_permission.permission_value.access_type == AccessType.EDITOR and sharer_permission.principal_type != PrincipalType.OWNER:
                    raise http_403("You are not allowed to change editor's permission")
                # logika da update permission
                updated_permission, updated_permission_value = permission_create_dto_to_domain(new_permission,
                                                                                               user_id=existing_permission.user_id,
                                                                                               principal_type=existing_permission.principal_type,
                                                                                               parent_directory_id=existing_permission.parent_directory_id)
                updated_permission_value.id = existing_permission.permission_value_id
                updated_permission.id = existing_permission.id
                updated_permission.permission_value_id = existing_permission.permission_value_id

                self.permission_service.update(updated_permission, updated_permission_value)

            else:
                shared_directory = self.directory_service.get_shared_directory_for_user(user.id)
                self.permission_service.save(*permission_create_dto_to_domain(new_permission,
                                                                              user_id=user.id,
                                                                              principal_type=PrincipalType.EMPLOYEE,
                                                                              parent_directory_id=shared_directory.id))







