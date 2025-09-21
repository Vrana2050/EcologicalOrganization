from dataclasses import asdict
from typing import Tuple, Optional

from app.api.dtos.permissions import PermissionCreateDTO
from app.domain.permissions import Permission, PermissionValue, AccessOrigin, PrincipalType
from app.infra.tables import Permissions, PermissionValues


def permission_create_dto_to_domain(dto: PermissionCreateDTO, *, user_id: Optional[int] = None,
                  group_id: Optional[int] = None,
                  principal_type: Optional[PrincipalType] = None,
                  parent_directory_id: Optional[int] = None
                  ) -> Tuple[Permission, PermissionValue]:

    permission_value = PermissionValue(
        id=None,
        access_type=dto.access_type,
        expires_at=dto.expires_at
    )

    permission = Permission(
        id=None,
        access_origin=AccessOrigin.DIRECT,
        principal_type=principal_type,
        user_id=user_id if dto.email else None,
        group_id=group_id if dto.group_name else None,
        directory_id=dto.directory_id,
        document_id=dto.document_id,
        parent_directory_id=parent_directory_id
    )

    return permission, permission_value


def permission_to_db(domain_obj: Permission) -> Permissions:
    return Permissions(id=domain_obj.id,
                       group_id=domain_obj.group_id,
                       principal_type=domain_obj.principal_type,
                       access_origin=domain_obj.access_origin,
                       user_id=domain_obj.user_id,
                       document_id=domain_obj.document_id,
                       parent_directory_id=domain_obj.parent_directory_id,
                       directory_id=domain_obj.directory_id,
                       permission_value_id=domain_obj.permission_value_id
                       )

def permission_value_to_db(domain_obj: PermissionValue) -> PermissionValues:
    return PermissionValues(**asdict(domain_obj))

def permission_from_db(db_obj: Permissions) -> Permission:
    return Permission(
        **{col.name: getattr(db_obj, col.name) for col in db_obj.__table__.columns},
        permission_value=permission_value_from_db(db_obj.permission_value) if db_obj.permission_value else None
    )

def permission_value_from_db(db_obj: PermissionValues) -> PermissionValue:
    return PermissionValue(**{col.name: getattr(db_obj, col.name) for col in db_obj.__table__.columns})
