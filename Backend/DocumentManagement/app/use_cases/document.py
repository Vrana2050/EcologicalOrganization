from datetime import UTC
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import Paragraph, Spacer, SimpleDocTemplate
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from datetime import datetime
from io import BytesIO

from app.api.dtos.documents import DocumentCreateDTO, DocumentUpdateDTO
from app.api.dtos.permissions import PermissionCreateDTO
from app.constants import ALLOWED_DOCUMENT_FORMATS, MAX_FILE_SIZE
from app.core.exceptions import http_400, http_404, http_403
from app.domain.directory import DirectoryType
from app.domain.document import DocumentFile, Document, DocumentStatus
from app.domain.permissions import Permission, AccessOrigin, PrincipalType, AccessType
from app.domain.retention import RetentionType
from app.infra.repo.document import DocumentRepository
import os
from .elastic_search_client import search as search_service
from .elastic_search_client import directories as es_directory_service
from .elastic_search_client.directories import DirectoryUpdateDTO as ElasticDirectoryUpdateDTO

from app.use_cases.directory import DirectoryService
from app.use_cases.permissions import PermissionService
from app.use_cases.user_group import UserGroupService
from .auth import get_user_by_email, get_users_by_ids
from .elastic_search_client.directories import MetadataCreateDTO
from .metadata import MetadataService
from .tag import TagService
from ..api.dtos.directory import DirectoryUpdateDTO
from ..api.dtos.metadata import MetadataValueCreateDTO
from ..api.dtos.search import AdvancedSearchRequest, SearchResults, map_to_elastic_search_request, \
    map_elastic_to_directory_search_results, map_elastic_to_document_search_results

from .elastic_search_client import documents as es_document_service
from .elastic_search_client.documents import DocumentCreateDTO as ElasticDocumentCreateDTO, DocumentPatchDTO, DocumentUpdateDTO as ElasticDocumentUpdateDTO

from ..domain.tags import Tag
from ..infra.mappers.document_open import document_to_dto
from ..infra.mappers.permissions import permission_create_dto_to_domain
import re
import calendar
from openai import OpenAI

class DocumentService:
    def __init__(self, document_repo: DocumentRepository,
                 directory_service: DirectoryService,
                 permission_service: PermissionService,
                 group_service: UserGroupService,
                 tag_service: TagService,
                 metadata_service: MetadataService):
        self.document_repo = document_repo
        self.directory_service = directory_service
        self.permission_service = permission_service
        self.group_service = group_service
        self.tag_service = tag_service
        self.metadata_service = metadata_service
        self.client = OpenAI(api_key="OPENAI_API_KEY")
    def open_document(self, document_id, user_id):
        highest_permission = self.document_repo.get_highest_permission_for_document(document_id, user_id)
        if highest_permission is None:
            raise http_403("You are not authorized to access this document")

        document = self.document_repo.get_by_id(document_id)
        if document is None:
            raise http_404("Document not found")

        user_ids = set()
        group_ids = set()

        if document.creator_id:
            user_ids.add(document.creator_id)

        for f in document.document_files:
            if f.uploader_id:
                user_ids.add(f.uploader_id)

        for p in document.permissions:
            if p.user_id:
                user_ids.add(p.user_id)
            if p.group_id:
                group_ids.add(p.group_id)

        user_ids = list(user_ids)
        group_ids = list(group_ids)

        raw_users: dict[int, str] = get_users_by_ids(user_ids)
        user_emails: dict[int, str] = {int(k): v for k, v in raw_users.items()}
        groups = self.group_service.get_groups_by_ids(group_ids)
        group_names: dict[int, str] = {group.id: group.name for group in groups}
        dto = document_to_dto(document, user_emails, group_names, highest_permission.access_type)

        path = [{"id": dto.id, "name": dto.name}]
        next_directory = self.directory_service.get_by_id(dto.parent_directory_id)

        while next_directory and self.permission_service.has_permission_for_directory(next_directory.id, user_id):
            path.append({"id": next_directory.id, "name": next_directory.name})
            if next_directory.parent_directory_id:
                next_directory = self.directory_service.get_by_id(next_directory.parent_directory_id)
            else:
                next_directory = None

        if next_directory:
            shared = self.directory_service.get_shared_directory(user_id)
            path.append({"id": shared.id, "name": shared.name})

        path.reverse()
        dto.path = path
        return dto


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

        try:
            es_document_service.create_document(ElasticDocumentCreateDTO(id=saved_document.id,
                                                                     name=saved_document.name,
                                                                     parent_directory_id=saved_document.parent_directory_id,
                                                                     creator_id=saved_document.creator_id,
                                                                     created_at=saved_document.created_at))
        except Exception as e:
            self.document_repo.delete(saved_document.id)
            raise e

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

    def upload_new_version(self, document_id, uploaded_file, user_id):
        file_extension = os.path.splitext(uploaded_file.filename)[1].lower()

        current_document = self.document_repo.get_by_id(document_id)
        if not current_document:
            raise http_404("Document not found.")

        if file_extension not in ALLOWED_DOCUMENT_FORMATS:
            raise http_400(f"File type '{file_extension}' is not allowed.")

        uploaded_file.file.seek(0, os.SEEK_END)
        file_size = uploaded_file.file.tell()
        uploaded_file.file.seek(0)

        if file_size > MAX_FILE_SIZE:
            raise http_400(f"File size exceeds the maximum limit of {MAX_FILE_SIZE / (1024 * 1024)} MB.")

        if not uploaded_file.filename or len(uploaded_file.filename) > 255:
            raise http_400("Invalid file name.")

        utc_now = datetime.now(UTC)

        new_version_number = max([file.version for file in current_document.document_files]) + 1

        saved_document = self.document_repo.save_new_version(Document(id=current_document.id,
                                                          parent_directory_id=current_document.parent_directory_id,
                                                          creator_id=current_document.creator_id,
                                                          retention_id=current_document.retention_id,
                                                          retention_type=current_document.retention_type,
                                                          retention_expires=current_document.retention_expires,
                                                          created_at=current_document.created_at,
                                                          active_version=new_version_number,
                                                          last_modified=utc_now,
                                                          name=current_document.name.split('.')[0]+ file_extension,
                                                          status=DocumentStatus.ACTIVE,
                                                          ),
                                                 DocumentFile(document_id=current_document.id,
                                                              file_size=file_size,
                                                              file_type=file_extension,
                                                              uploader_id=user_id,
                                                              version=new_version_number,
                                                              uploaded_at=utc_now,
                                                              physical_path="",
                                                              file_name=uploaded_file.filename,
                                                              summary=""))

        document_file = saved_document.document_files[-1]
        physical_path = document_file.physical_path

        with open(physical_path, "wb") as f:

            uploaded_file.file.seek(0)
            f.write(uploaded_file.file.read())

        es_document_service.patch_document(saved_document.id, DocumentPatchDTO(name=saved_document.name))


    def restore_version(self, document_id, version, user_id):

        current_document = self.document_repo.get_by_id(document_id)
        if not current_document:
            raise http_404("Document not found.")

        document_file = None

        for file in current_document.document_files:
            if file.version == version:
                document_file = file
                break

        if not document_file:
            raise http_404("Version not found.")

        name_without_extension = current_document.name.rsplit('.', 1)[0]
        current_document.name = name_without_extension + document_file.file_type
        current_document.active_version = document_file.version
        updated_doc = self.document_repo.update_version(current_document)

        es_document_service.patch_document(document_id, DocumentPatchDTO(name=updated_doc.name, summary=document_file.summary))


    def update_document(self, document: DocumentUpdateDTO, user_id: int):
        user_permission = self.document_repo.get_highest_permission_for_document(document.document_id, user_id)

        if user_permission and user_permission.access_type != AccessType.EDITOR:
            raise http_403("You do not have permission to edit this document.")

        existing_document = self.document_repo.get_by_id(document.document_id)
        if not existing_document:
            raise http_404("Document not found.")

        invalid_chars_pattern = r'[\\/:*?"<>|]'
        if re.search(invalid_chars_pattern, document.document_name):
            raise http_400("Document name contains invalid characters: \\ / : * ? \" < > |")

        if len(document.document_name.strip()) < 3:
            raise http_400("Document name must contain at least 3 characters.")

        document.document_name = document.document_name.strip()

        elastic_metadata =  self.update_document_metadata(document)

        elastic_tags = self.update_tags_for_document(document)

        updated_doc = self.document_repo.rename_document(document.document_id, document.document_name)

        es_document_service.update_document(ElasticDocumentUpdateDTO(id=updated_doc.id,
                                                                     name=updated_doc.name,
                                                                     tags=elastic_tags,
                                                                     metadata=elastic_metadata))


    def update_directory(self, updated_directory: DirectoryUpdateDTO, user_id: int):
        user_permission = self.permission_service.get_highest_permission_for_directory(updated_directory.directory_id, user_id)

        if user_permission and user_permission.access_type != AccessType.EDITOR:
            raise http_403("You do not have permission to edit this directory.")

        existing_directory = self.directory_service.get_by_id(updated_directory.directory_id)
        if not existing_directory:
            raise http_404("Document not found.")

        invalid_chars_pattern = r'[\\/:*?"<>|]'
        if re.search(invalid_chars_pattern, updated_directory.directory_name):
            raise http_400("Document name contains invalid characters: \\ / : * ? \" < > |")

        updated_directory.directory_name = updated_directory.directory_name.strip()

        if len(updated_directory.directory_name) < 3:
            raise http_400("Document name must contain at least 3 characters.")

        elastic_metadata = self.update_directory_metadata(updated_directory)

        elastic_tags = self.update_tags_for_directory(updated_directory)

        updated_dir = self.directory_service.rename_directory(updated_directory.directory_id, updated_directory.directory_name)


        es_directory_service.update_directory(ElasticDirectoryUpdateDTO(id=updated_dir.id,
                                                                        name=updated_directory.directory_name,
                                                                        tags=elastic_tags,
                                                                        metadata=elastic_metadata))



    def update_tags_for_document(self, document):
        self.tag_service.remove_all_tags_from_document(document.document_id)

        tags: list[int] = []
        for tag_name in document.tags:
            tag = self.tag_service.get_tag_by_name(tag_name)
            if not tag:
                tag = self.tag_service.create_tag(Tag(name=tag_name))
            tags.append(tag.id)

            self.tag_service.assign_tag_to_document(tag.id, document.document_id)

        return tags

    def update_document_metadata(self, document: DocumentUpdateDTO):

        metadata_ids = {meta.metadata_id for meta in document.metadata}
        metadata_list = self.metadata_service.get_metadata_by_ids(metadata_ids)

        if len(metadata_list) != len(metadata_ids):
            raise http_400("Invalid metadata")

        metadata_map = {m.id: m for m in metadata_list}

        validated_metadata = []
        raw_metadata_dto_list: list[MetadataCreateDTO] = []
        for meta in document.metadata:
            db_meta = metadata_map.get(meta.metadata_id)
            if not db_meta:
                raise http_400(f"Metadata {meta.metadata_id} not found")

            raw_metadata_dto_list.append(
                MetadataCreateDTO(
                    id=meta.metadata_id,
                    type=db_meta.metadata_type,
                    value=meta.value
                ))

            try:
                validated_value = db_meta.validate_value(meta.value)
            except ValueError as e:
                raise http_400(str(e))

            validated_metadata.append(
                MetadataValueCreateDTO(
                    document_id=document.document_id,
                    metadata_id=meta.metadata_id,
                    value=validated_value
                )
            )

        self.metadata_service.delete_metavalues_for_document(document.document_id)

        for metadata_value in validated_metadata:
            self.metadata_service.add_metadata_value(metadata_value)

        return raw_metadata_dto_list

    def add_summary(self, document_id, summary, user_id):
        user_permission = self.document_repo.get_highest_permission_for_document(document_id, user_id)

        if user_permission and user_permission.access_type != AccessType.EDITOR:
            raise http_403("You do not have permission to edit this document.")

        if self.document_repo.get_by_id(document_id) is None:
            raise http_404("Document not found.")

        if len(summary) > 2000:
            raise http_400(f"Summary too long {len(summary)}")

        self.document_repo.add_summary(document_id, summary)

        es_document_service.patch_document(document_id, DocumentPatchDTO(summary=summary))


    def delete_document(self, document_id, user_id):
        user_permission = self.document_repo.get_highest_permission_for_document(document_id, user_id)

        if user_permission and user_permission.access_type != AccessType.EDITOR:
            raise http_403("You do not have permission to delete this document.")

        if self.document_repo.get_by_id(document_id) is None:
            raise http_404("Document not found.")

        self.document_repo.delete(document_id)

        es_document_service.delete_document(document_id)

    def update_directory_metadata(self, updated_directory):
        metadata_ids = {meta.metadata_id for meta in updated_directory.metadata}
        metadata_list = self.metadata_service.get_metadata_by_ids(metadata_ids)

        if len(metadata_list) != len(metadata_ids):
            raise http_400("Invalid metadata")

        metadata_map = {m.id: m for m in metadata_list}

        validated_metadata = []
        raw_metadata_dto_list: list[MetadataCreateDTO] = []
        for meta in updated_directory.metadata:
            db_meta = metadata_map.get(meta.metadata_id)
            if not db_meta:
                raise http_400(f"Metadata {meta.metadata_id} not found")

            raw_metadata_dto_list.append(
                MetadataCreateDTO(
                    id=meta.metadata_id,
                    type=db_meta.metadata_type,
                    value=meta.value
                ))

            try:
                validated_value = db_meta.validate_value(meta.value)
            except ValueError as e:
                raise http_400(str(e))

            validated_metadata.append(
                MetadataValueCreateDTO(
                    directory_id=updated_directory.directory_id,
                    metadata_id=meta.metadata_id,
                    value=validated_value
                )
            )

        self.metadata_service.delete_metavalues_for_directory(updated_directory.directory_id)

        for metadata_value in validated_metadata:
            self.metadata_service.add_metadata_value(metadata_value)

        return raw_metadata_dto_list

    def update_tags_for_directory(self, updated_directory):
        self.tag_service.remove_all_tags_from_directory(updated_directory.directory_id)

        tags: list[int] = []
        for tag_name in updated_directory.tags:
            tag = self.tag_service.get_tag_by_name(tag_name)
            if not tag:
                tag = self.tag_service.create_tag(Tag(name=tag_name))

            self.tag_service.assign_tag_to_directory(tag.id, updated_directory.directory_id)
            tags.append(tag.id)
        return tags

    def search(self, search_request: AdvancedSearchRequest, user_id: int) -> SearchResults:
        user_group_ids = self.group_service.get_group_ids_for_user(user_id)
        allowed_directory_ids = self.permission_service.get_all_user_directory_permissions(user_id, user_group_ids)
        allowed_document_ids = self.permission_service.get_all_user_document_permissions(user_id, user_group_ids)

        if not allowed_directory_ids and not allowed_document_ids:
            return SearchResults(documents=[], directories=[], page_size=0, page=0, total_count=0, total_pages=0)


        if search_request.is_empty():
            return self.return_all_documents_and_directories(user_id, search_request.page, search_request.page_size, allowed_directory_ids, allowed_document_ids)

        creator_id: int | None = None
        parent_directory_ids: list[int] = []
        if search_request.creator_email:
            try:
                creator_id = get_user_by_email(search_request.creator_email).id
            except Exception as e:
                return SearchResults(documents=[], directories=[], page_size=0, page=0, total_count=0, total_pages=0)

        if search_request.parent_directory_name:
            parent_directory_ids = self.directory_service.get_directory_ids_by_name(search_request.parent_directory_name)
            if not parent_directory_ids:
                return SearchResults(documents=[], directories=[], page_size=0, page=0, total_count=0, total_pages=0)
        all_tags = self.tag_service.get_all_tags()
        tag_dict = {tag.id: tag.name for tag in all_tags}

        all_metadata = self.metadata_service.get_all_metadata()
        meta_dict = {meta.id: meta.metadata_type for meta in all_metadata}
        for meta in search_request.metadata:
            meta.metadata_type = meta_dict[meta.id]

        elastic_search_request = map_to_elastic_search_request(search_request, parent_directory_ids, creator_id, allowed_directory_ids, allowed_document_ids)
        results = search_service.search(elastic_search_request)

        document_results = []
        directory_results = []
        for dir in results.directories:
            tag_list = [tag_dict[tag] for tag in dir.tags]
            access_type = dir.access_type = self.permission_service.get_highest_permission_for_directory(dir.directory_id, user_id).access_type
            directory_results.append(map_elastic_to_directory_search_results(dir, tag_list, access_type))

        for doc in results.documents:
            tag_list = [tag_dict[tag] for tag in doc.tags]
            access_type = self.document_repo.get_highest_permission_for_document(doc.document_id, user_id).access_type
            document_results.append(map_elastic_to_document_search_results(doc, tag_list, access_type))

        return SearchResults(documents=document_results, directories=directory_results, page_size=results.page_size, page=results.page, total_count=results.total_count, total_pages=results.total_pages)

    def search_generate_pdf(self, search_request: AdvancedSearchRequest, user_id: int) -> SearchResults:
        user_group_ids = self.group_service.get_group_ids_for_user(user_id)
        allowed_directory_ids = self.permission_service.get_all_user_directory_permissions(user_id, user_group_ids)
        allowed_document_ids = self.permission_service.get_all_user_document_permissions(user_id, user_group_ids)

        if not allowed_directory_ids and not allowed_document_ids:
            return SearchResults(documents=[], directories=[], page_size=0, page=0, total_count=0, total_pages=0)


        if search_request.is_empty():
            return self.return_all_documents_and_directories(user_id, search_request.page, search_request.page_size, allowed_directory_ids, allowed_document_ids)

        creator_id: int | None = None
        parent_directory_ids: list[int] = []
        if search_request.creator_email:
            try:
                creator_id = get_user_by_email(search_request.creator_email).id
            except Exception as e:
                return SearchResults(documents=[], directories=[], page_size=0, page=0, total_count=0, total_pages=0)

        if search_request.parent_directory_name:
            parent_directory_ids = self.directory_service.get_directory_ids_by_name(search_request.parent_directory_name)
            if not parent_directory_ids:
                return SearchResults(documents=[], directories=[], page_size=0, page=0, total_count=0, total_pages=0)
        all_tags = self.tag_service.get_all_tags()
        tag_dict = {tag.id: tag.name for tag in all_tags}

        all_metadata = self.metadata_service.get_all_metadata()
        meta_dict = {meta.id: meta.metadata_type for meta in all_metadata}
        for meta in search_request.metadata:
            meta.metadata_type = meta_dict[meta.id]

        elastic_search_request = map_to_elastic_search_request(search_request, parent_directory_ids, creator_id, allowed_directory_ids, allowed_document_ids)
        results = search_service.search_pdf_results(elastic_search_request)

        document_results = []
        directory_results = []
        for dir in results.directories:
            tag_list = [tag_dict[tag] for tag in dir.tags]
            access_type = dir.access_type = self.permission_service.get_highest_permission_for_directory(dir.directory_id, user_id).access_type
            directory_results.append(map_elastic_to_directory_search_results(dir, tag_list, access_type))

        for doc in results.documents:
            tag_list = [tag_dict[tag] for tag in doc.tags]
            access_type = self.document_repo.get_highest_permission_for_document(doc.document_id, user_id).access_type
            document_results.append(map_elastic_to_document_search_results(doc, tag_list, access_type))

        return SearchResults(documents=document_results, directories=directory_results, page_size=results.page_size, page=results.page, total_count=results.total_count, total_pages=results.total_pages)


    def return_all_documents_and_directories(self,user_id: int, page: int, page_size: int, allowed_directory_ids: list[int], allowed_document_ids: list[int]):
        search_res = self.document_repo.return_all_documents_and_directories_for_user(page, page_size, allowed_directory_ids, allowed_document_ids)
        for dir in search_res.directories:
            dir.access_type = self.permission_service.get_highest_permission_for_directory(dir.directory_id, user_id).access_type
            dir.metadata = []
        for doc in search_res.documents:
            doc.access_type = self.document_repo.get_highest_permission_for_document(doc.document_id, user_id).access_type
            doc.metadata = []

        return search_res

    def generate_report(self, year_month, user_id, user_email) -> int:

        parent_id = self.directory_service.get_audit_log_reports()

        file_extension = '.pdf'

        # pozovi onu proceduru
        results = self.document_repo.get_analytics_report(year_month)

        # izgenerisi mi pdf na osnovu dobavljenih podataka iz procedure
        generated_pdf_file = BytesIO()

        # Formatiraj mesec za naslov: 2025-08 -> August 2025
        year, month = year_month.split("-")
        month_name = calendar.month_name[int(month)]
        formatted_title = f"{month_name} {year}"

        doc = SimpleDocTemplate(
            generated_pdf_file,
            pagesize=landscape(A4),
            title=f"Analytics Report {formatted_title}"
        )

        styles = getSampleStyleSheet()
        elements = []

        # Naslov
        elements.append(Paragraph(f"Activity Report - {formatted_title}", styles["Title"]))
        elements.append(Spacer(1, 12))

        # Funkcija za zaglavlje na svakoj stranici
        def add_page_header(canvas, doc):
            canvas.saveState()
            canvas.setFont("Helvetica-Bold", 10)
            canvas.drawString(55, 460, f"Generated by: {user_email}")
            canvas.drawString(705, 460, f"Date: {datetime.now().strftime('%d/%m/%Y')}")
            canvas.restoreState()

        if not results:
            elements.append(Paragraph("No data found for this month.", styles["Normal"]))
        else:
            table_data = [[
                "User Email", "Object Type", "Create", "Delete", "Edit",
                "Move", "Download", "Preview", "Total", "Avg/Day",
                "First Action", "Last Action"
            ]]

            for r in results:
                table_data.append([
                    r["user_email"],
                    r["object_type"],
                    r["create_count"],
                    r["delete_count"],
                    r["edit_count"],
                    r["move_count"],
                    r["download_count"],
                    r["preview_count"],
                    r["total_actions"],
                    r["avg_per_day"],
                    str(r["first_action"]),
                    str(r["last_action"])
                ])

            # Tabela sa stilom
            table = Table(table_data, repeatRows=1)
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#003366")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ]))
            elements.append(Spacer(1, 36))
            elements.append(table)

        # Build PDF sa zaglavljem
        doc.build(elements, onFirstPage=add_page_header, onLaterPages=add_page_header)
        generated_pdf_file.seek(0)
        # ✅ Veličina fajla
        file_size = len(generated_pdf_file.getvalue())


        utc_now = datetime.now(UTC)

        saved_document = self.document_repo.save(Document(id=None,
                                                          parent_directory_id=parent_id,
                                                          creator_id=user_id,
                                                          retention_id=None,
                                                          retention_type=RetentionType.INHERITED,
                                                          retention_expires=None,
                                                          created_at=utc_now,
                                                          active_version=1,
                                                          last_modified=utc_now,
                                                          name=f'report-{year_month}.pdf',
                                                          status=DocumentStatus.ACTIVE,
                                                          ),
                                                 DocumentFile(document_id=None,
                                                              file_size=file_size,
                                                              file_type=file_extension,
                                                              uploader_id=user_id,
                                                              version=1,
                                                              uploaded_at=utc_now,
                                                              physical_path="",
                                                              file_name=f'report-{year_month}.pdf',
                                                              summary=""))

        document_file = saved_document.document_files[0]
        physical_path = document_file.physical_path

        with open(physical_path, "wb") as f:

            generated_pdf_file.seek(0)
            f.write(generated_pdf_file.read())

        for permission in self.permission_service.get_all_permission_for_directory(saved_document.parent_directory_id):
            self.permission_service.save(Permission(id=None, access_origin=AccessOrigin.INHERITED,
                                                    principal_type=permission.principal_type,
                                                    user_id=permission.user_id if permission.user_id else None,
                                                    directory_id=None,
                                                    parent_directory_id=permission.directory_id,
                                                    group_id=permission.group_id if permission.group_id else None,
                                                    document_id=saved_document.id,
                                                    permission_value_id=permission.permission_value_id))

        es_document_service.create_document(ElasticDocumentCreateDTO(id=saved_document.id,
                                                                     name=saved_document.name,
                                                                     parent_directory_id=saved_document.parent_directory_id,
                                                                     creator_id=saved_document.creator_id,
                                                                     created_at=saved_document.created_at))


        return saved_document.id

    def generate_pdf(self, search_request, user_id, email):
        parent_id = self.directory_service.get_audit_log_reports()

        file_extension = '.pdf'


        results = self.search_generate_pdf(search_request, user_id)
        utc_now = datetime.now(UTC)

        generated_pdf_file = self.generate_advanced_search_pdf(results, search_request, email)

        generated_pdf_file.seek(0)
        # file size
        file_size = len(generated_pdf_file.getvalue())

        saved_document = self.document_repo.save(Document(id=None,
                                                          parent_directory_id=parent_id,
                                                          creator_id=user_id,
                                                          retention_id=None,
                                                          retention_type=RetentionType.INHERITED,
                                                          retention_expires=None,
                                                          created_at=utc_now,
                                                          active_version=1,
                                                          last_modified=utc_now,
                                                          name=f'SomeTitle.pdf',
                                                          status=DocumentStatus.ACTIVE,
                                                          ),
                                                 DocumentFile(document_id=None,
                                                              file_size=file_size,
                                                              file_type=file_extension,
                                                              uploader_id=user_id,
                                                              version=1,
                                                              uploaded_at=utc_now,
                                                              physical_path="",
                                                              file_name=f'report-search.pdf',
                                                              summary=""))

        document_file = saved_document.document_files[0]
        physical_path = document_file.physical_path


        for permission in self.permission_service.get_all_permission_for_directory(saved_document.parent_directory_id):
            self.permission_service.save(Permission(id=None, access_origin=AccessOrigin.INHERITED,
                                                    principal_type=permission.principal_type,
                                                    user_id=permission.user_id if permission.user_id else None,
                                                    directory_id=None,
                                                    parent_directory_id=permission.directory_id,
                                                    group_id=permission.group_id if permission.group_id else None,
                                                    document_id=saved_document.id,
                                                    permission_value_id=permission.permission_value_id))

        es_document_service.create_document(ElasticDocumentCreateDTO(id=saved_document.id,
                                                                     name=saved_document.name,
                                                                     parent_directory_id=saved_document.parent_directory_id,
                                                                     creator_id=saved_document.creator_id,
                                                                     created_at=saved_document.created_at))

        generated_pdf_file.seek(0)

        if physical_path:
            with open(physical_path, "wb") as f:
                f.write(generated_pdf_file.read())

    def generate_advanced_search_pdf(self, results, search_request, user_email):
        """
        results: SearchResults
        search_request: AdvancedSearchRequest
        metadata_names: dict[int, str] -> mapping metadata ID to display name
        """
        tag_names = [tag.name for tag in self.tag_service.get_all_tags() if tag.id in search_request.tags]

        # Registracija fontova
        pdfmetrics.registerFont(TTFont('DejaVuSans', 'fonts/DejaVuSans.ttf'))
        pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', 'fonts/DejaVuSans-Bold.ttf'))

        # Mapiranje normal/bold/italic/boldItalic varijanti
        registerFontFamily('DejaVuSans',
                           normal='DejaVuSans',
                           bold='DejaVuSans-Bold',
                           italic='DejaVuSans',
                           boldItalic='DejaVuSans-Bold')

        # Stilovi
        styles = getSampleStyleSheet()
        styles['Normal'].fontName = 'DejaVuSans'
        styles['Heading2'].fontName = 'DejaVuSans'
        styles['Heading4'].fontName = 'DejaVuSans'

        # Stil za summary sa podrškom za <b>
        summary_style = ParagraphStyle(
            'Summary',
            parent=styles['Normal'],
            fontName='DejaVuSans',
            leading=12,
            alignment=TA_LEFT
        )

        metadata_names = {meta.id: meta.name for meta in self.metadata_service.get_all_metadata()}
        generated_pdf_file = BytesIO()
        doc = SimpleDocTemplate(
            generated_pdf_file,
            pagesize=landscape(A4),
            title="Advanced Search Report"
        )

        elements = []

        # Naslov
        elements.append(Paragraph("Advanced Search Report", styles["Title"]))
        elements.append(Spacer(1, 12))

        # Prikaži parametre pretrage
        elements.append(Paragraph("<b>Search Parameters:</b>", styles['Heading4']))
        if search_request.search_term:
            elements.append(Paragraph(f"<b>Search Term:</b> <font color='#6AA84F'><b>{search_request.search_term}</b></font>", styles['Normal']))
        elements.append(Paragraph(f"<b>Search Type:</b> {search_request.search_term_type.value}", styles['Normal']))
        if search_request.parent_directory_name:
            elements.append(Paragraph(f"<b>Folder Name:</b> {search_request.parent_directory_name}", styles['Normal']))
        if search_request.created_from or search_request.created_to:
            created_range = f"{search_request.created_from or '-'} to {search_request.created_to or '-'}"
            elements.append(Paragraph(f"<b>Created:</b> {created_range}", styles['Normal']))
        if search_request.creator_email:
            elements.append(Paragraph(f"<b>Creator:</b> {search_request.creator_email}", styles['Normal']))
        if search_request.tags:
            elements.append(
                Paragraph(
                    f"<b>Tags:</b> <font color='#6AA84F'><b>#{'&nbsp;&nbsp;#'.join(map(str, tag_names))}</b></font>",
                    styles['Normal']
                )
            )
        if search_request.metadata:
            metadata_str = ", ".join([f"{metadata_names.get(m.id, f'Meta {m.id}')} ({m.operator.value} {m.value})"
                                      for m in search_request.metadata])
            elements.append(Paragraph(f"<b>Metadata Filters:</b> {metadata_str}", styles['Normal']))
        elements.append(Spacer(1, 12))

        # Funkcija za zaglavlje na svakoj stranici
        def add_page_header(canvas, doc):
            canvas.saveState()
            canvas.setFont("DejaVuSans", 10)
            canvas.drawString(55, 550, f"Generated by: {user_email}")
            canvas.drawString(720, 550, f"Date: {datetime.now().strftime('%d/%m/%Y')}")
            canvas.restoreState()

        # Dodaj directories
        for d in results.directories:
            elements.append(Paragraph(f"<b>Directory:</b> {d.name}", styles['Heading4']))
            elements.append(Paragraph(f"Tags: {', '.join(d.tags) if d.tags else '-'}", styles['Normal']))
            elements.append(Paragraph(f"Search Score: {d.score:.2f}", styles['Normal']))
            # Custom metadata
            for m in search_request.metadata:
                meta_val = next((x["value"] for x in d.metadata if x["metadata_id"] == m.id), "-")
                elements.append(Paragraph(f"{metadata_names.get(m.id, f'Meta {m.id}')}: {meta_val}", styles['Normal']))
            elements.append(Spacer(1, 12))

        # Dodaj documents
        for doc_item in results.documents:
            elements.append(Paragraph(f"<b>Document:</b> {doc_item.name}", styles['Heading4']))
            elements.append(Paragraph(f"Tags: {', '.join(doc_item.tags) if doc_item.tags else '-'}", styles['Normal']))
            elements.append(Paragraph(f"Score: {doc_item.score:.2f}", styles['Normal']))
            elements.append(Paragraph(f"Access: {doc_item.access_type}", styles['Normal']))
            # Custom metadata
            for m in search_request.metadata:
                meta_val = next((x["value"] for x in doc_item.metadata if x["metadata_id"] == m.id), "-")
                elements.append(Paragraph(f"{metadata_names.get(m.id, f'Meta {m.id}')}: {meta_val}", styles['Normal']))
            # Summary sa boldovanim rečima
            if getattr(doc_item, "summary", None):
                elements.append(Paragraph(doc_item.summary, summary_style))
            elements.append(Spacer(1, 12))

        # Build PDF sa zaglavljem
        doc.build(elements, onFirstPage=add_page_header, onLaterPages=add_page_header)
        return generated_pdf_file

    def generate_summary(self, document_id, user_id):
        user_permission = self.document_repo.get_highest_permission_for_document(document_id, user_id)

        if user_permission and user_permission.access_type != AccessType.EDITOR:
            raise http_403("You do not have permission to summarize this document.")

        document = self.document_repo.get_by_id(document_id)
        if document is None:
            raise http_404("Document not found.")

        file_path = None

        for file in document.document_files:
            if file.version == document.active_version:
                file_path = file.physical_path
                break

        if file_path is None:
            raise http_404("File not found.")

        with open(file_path, "rb") as f:
            uploaded_file = self.client.files.create(file=f, purpose="assistants")

        response = self.client.chat.completions.create(
            model="gpt-4.1-mini",
            max_tokens=700,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a document summarizer. "
                        "Summarize the provided file in plain text only — do not use Markdown, bullet points, or any formatting. "
                        "The summary must not exceed 1500 characters. "
                        "Be concise but informative, using natural sentences only."
                    )
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "file",
                            "file": {"file_id": uploaded_file.id}  # <-- TAČNO
                        }
                    ]
                }
            ]
        )

        summary = response.choices[0].message.content.strip()

        return summary[:2000]












