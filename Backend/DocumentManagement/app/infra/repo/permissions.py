from typing import List

from sqlalchemy.orm.session import Session
from app.domain.permissions import Permission, PermissionValue
from app.infra.mappers.permissions import permission_to_db, permission_from_db, permission_value_to_db, \
    permission_value_from_db
from app.infra.tables import Permissions, PermissionValues


class PermissionRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_all_section_permissions(self, user_id) -> List[Permission]:

        permissions = self.db.query(Permissions).filter(Permissions.user_id == user_id,
                                                        Permissions.parent_directory_id.is_(None)).all()

        return [permission_from_db(permission) for permission in permissions]


    def save(self, permission: Permission) -> Permission:
        new_permission = permission_to_db(permission)
        self.db.add(new_permission)
        self.db.commit()
        self.db.refresh(new_permission)
        return permission_from_db(new_permission)


    def update(self, permission: Permission) -> Permission:
        db_obj = self.db.get(Permissions, permission.id)

        db_obj.access_origin = permission.access_origin
        db_obj.principal_type = permission.principal_type
        db_obj.user_id = permission.user_id
        db_obj.group_id = permission.group_id
        db_obj.directory_id = permission.directory_id
        db_obj.document_id = permission.document_id
        db_obj.parent_directory_id = permission.parent_directory_id
        db_obj.permission_value_id = permission.permission_value_id

        self.db.commit()
        self.db.refresh(db_obj)

        return permission_from_db(db_obj)


    def get_all_permissions_for_directory(self, directory_id) -> List[Permission]:
        permissions = self.db.query(Permissions).filter(Permissions.directory_id == directory_id).all()

        return [permission_from_db(permission) for permission in permissions]


    def get_permission_for_user_directory(self, creator_id: int, directory_id: int) -> Permission:
        return permission_from_db(self.db.query(Permissions).filter(Permissions.directory_id == directory_id,
                             Permissions.user_id == creator_id).first())

    def get_permission_for_user_document(self, user_id, document_id):
        return permission_from_db(self.db.query(Permissions).filter(Permissions.document_id == document_id,
                                                                    Permissions.user_id == user_id).first())

    def get_permission_for_group_directory(self, group_id: int, directory_id: int) -> Permission:
        return permission_from_db(self.db.query(Permissions).filter(Permissions.directory_id == directory_id,
                                                                    Permissions.group_id == group_id).first())

    def get_permission_for_document_and_user(self, user_id, document_id) -> Permission | None:
        perm = self.db.query(Permissions).filter(Permissions.document_id == document_id,
                                                                    Permissions.user_id == user_id).first()
        if not perm:
            return None
        return permission_from_db(perm)

    def get_permission_for_directory_and_user(self, user_id, directory_id) -> Permission:
        return permission_from_db(self.db.query(Permissions).filter(Permissions.document_id == directory_id,
                                                                    Permissions.user_id == user_id).first())

    def get_permission_for_document_and_group(self, group_id, document_id) -> Permission:
        return permission_from_db(self.db.query(Permissions).filter(Permissions.document_id == document_id,
                                                                    Permissions.group_id == group_id).first())



class PermissionValueRepository:
    def __init__(self, db: Session):
        self.db = db

    def save(self, permission_value: PermissionValue) -> PermissionValue:
        new_permission_value = permission_value_to_db(permission_value)
        self.db.add(new_permission_value)
        self.db.commit()
        self.db.refresh(new_permission_value)
        return permission_value_from_db(new_permission_value)

    def update(self, permission_value: PermissionValue) -> PermissionValue:
        db_obj = self.db.get(PermissionValues, permission_value.id)

        db_obj.access_type = permission_value.access_type
        db_obj.expires_at = permission_value.expires_at

        self.db.commit()
        self.db.refresh(db_obj)

        return permission_value_from_db(db_obj)
