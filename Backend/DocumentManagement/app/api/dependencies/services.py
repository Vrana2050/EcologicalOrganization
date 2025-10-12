from fastapi import Depends
from app.infra.database import get_db
from sqlalchemy.orm.session import Session

from app.infra.repo.document import DocumentRepository
from app.infra.repo.metadata import MetadataRepository
from app.infra.repo.permissions import PermissionRepository, PermissionValueRepository
from app.infra.repo.tags import TagRepository
from app.infra.repo.user_groups import UserGroupRepository
from app.use_cases.directory import DirectoryService
from app.infra.repo.directory import DirectoryRepository
from app.use_cases.document import DocumentService
from app.use_cases.metadata import MetadataService
from app.use_cases.permissions import PermissionValueService, PermissionService
from app.use_cases.tag import TagService
from app.use_cases.user_group import UserGroupService

def get_metadata_service(
    db: Session = Depends(get_db),
) -> MetadataService:
    return MetadataService(MetadataRepository(db))

def get_tag_service(
        db: Session = Depends(get_db),
) -> TagService:
    return TagService(TagRepository(db))

def get_permission_value_service(
    db: Session = Depends(get_db)
) -> PermissionValueService:
    return PermissionValueService(PermissionValueRepository(db))


def get_user_group_service(
        db: Session = Depends(get_db)
) -> UserGroupService:
    return UserGroupService(UserGroupRepository(db))


def get_permission_service(
    db: Session = Depends(get_db),
    permission_value_service: PermissionValueService = Depends(get_permission_value_service),
    user_group_service: UserGroupService = Depends(get_user_group_service),
) -> PermissionService:
    return PermissionService(
        PermissionRepository(db),
        permission_value_service,
        user_group_service
    )


def get_directory_service(
    db: Session = Depends(get_db),
    permission_service: PermissionService = Depends(get_permission_service)
) -> DirectoryService:
    return DirectoryService(
        DirectoryRepository(db),
        permission_service
    )



def get_document_service(
    db: Session = Depends(get_db),
    directory_service: DirectoryService = Depends(get_directory_service),
    permission_service: PermissionService = Depends(get_permission_service),
    user_group_service: UserGroupService = Depends(get_user_group_service),
    tag_service: TagService = Depends(get_tag_service),
    metadata_service: MetadataService = Depends(get_metadata_service)
) -> DocumentService:
    return DocumentService(
        DocumentRepository(db),
        directory_service,
        permission_service,
        user_group_service,
        tag_service,
        metadata_service
    )