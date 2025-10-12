from app.domain.directory import Directory, DirectoryType, RetentionType
from app.infra.mappers.document import document_from_db
from app.infra.mappers.metadata import custom_metadata_value_from_db
from app.infra.mappers.permissions import permission_from_db
from app.infra.mappers.tags import tag_db_to_domain
from app.infra.tables import Directories
from app.api.dtos.directory import CreateDirectoryDTO
from datetime import datetime, UTC


def db_to_domain(db_obj: Directories) -> Directory:
    return Directory(
        id=db_obj.id,
        name=db_obj.name,
        created_at=db_obj.created_at,
        creator_id=db_obj.creator_id,
        last_modified=db_obj.last_modified,
        retention_type=RetentionType(db_obj.retention_type),
        directory_type=DirectoryType(db_obj.directory_type),
        parent_directory_id=db_obj.parent_directory_id,
        retention_id=db_obj.retention_id,

        permissions=[permission_from_db(p) for p in db_obj.permissions]
    )

def directory_from_db(db_dir: Directories) -> Directory:
    return Directory(
        id=db_dir.id,
        name=db_dir.name,
        created_at=db_dir.created_at,
        creator_id=db_dir.creator_id,
        last_modified=db_dir.last_modified,
        retention_type=RetentionType(db_dir.retention_type),
        directory_type=DirectoryType(db_dir.directory_type),
        parent_directory_id=db_dir.parent_directory_id,
        retention_id=db_dir.retention_id,

        subdirectories=[db_to_domain(sd) for sd in db_dir.parent_directory_reverse],
        documents=[document_from_db(doc) for doc in db_dir.documents],
        permissions=[permission_from_db(p) for p in db_dir.permissions],
        tags=[tag_db_to_domain(ta.tag) for ta in db_dir.tag_assignments],
        custom_metadata_values=[custom_metadata_value_from_db(mv) for mv in db_dir.custom_metadata_values],
    )



def domain_to_db(domain_obj: Directory) -> Directories:

    return Directories(
        id = domain_obj.id,
        name = domain_obj.name,
        created_at = domain_obj.created_at,
        creator_id = domain_obj.creator_id,
        last_modified = domain_obj.last_modified,
        retention_type = domain_obj.retention_type,
        directory_type = domain_obj.directory_type,
        parent_directory_id = domain_obj.parent_directory_id,
        retention_id = domain_obj.retention_id)



def dto_to_domain(dto: CreateDirectoryDTO, creator_id) -> Directory:
    now = datetime.now(UTC)
    return Directory(
        id=None,
        name=dto.name,
        created_at=now,
        creator_id=creator_id,
        last_modified=now,
        retention_type=RetentionType.INHERITED,
        directory_type=DirectoryType.REGULAR,
        parent_directory_id=dto.parent_directory_id,
        retention_id=None
    )

