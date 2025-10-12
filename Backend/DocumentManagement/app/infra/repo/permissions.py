from typing import List

from sqlalchemy.orm.session import Session
from app.domain.permissions import Permission, PermissionValue
from app.infra.mappers.permissions import permission_to_db, permission_from_db, permission_value_to_db, \
    permission_value_from_db
from app.infra.tables import Permissions, PermissionValues
from sqlalchemy import text
from sqlalchemy import or_

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

    def get_permission_for_document_and_group(self, group_id, document_id) -> Permission | None:
        perm =  self.db.query(Permissions).filter(Permissions.document_id == document_id,
                                                                    Permissions.group_id == group_id).first()
        if not perm:
            return None
        return permission_from_db(perm)


    def get_highest_permission_for_directory(self, directory_id, user_id):
        sql = text("""
                    WITH ugroups AS (
                        SELECT gm.group_id
                        FROM group_members gm
                        WHERE gm.user_id = :user_id
                    ),
                    ranked_permissions AS (
                        SELECT 
                            p.directory_id, 
                            pv.access_type,
                            CASE pv.access_type
                                WHEN 'EDITOR'  THEN 3
                                WHEN 'VIEWER'  THEN 2
                                WHEN 'PREVIEW' THEN 1
                            END AS access_rank
                        FROM permissions p
                        JOIN permission_values pv ON pv.id = p.permission_value_id
                        WHERE p.directory_id = :directory_id
                          AND (
                                p.user_id = :user_id
                             OR p.group_id IN (SELECT group_id FROM ugroups)
                          )
                    )
                    SELECT 
                        rp.directory_id, d.name,
                        CASE MAX(rp.access_rank)
                            WHEN 3 THEN 'EDITOR'
                            WHEN 2 THEN 'VIEWER'
                            WHEN 1 THEN 'PREVIEW'
                        END AS access_type
                    FROM ranked_permissions rp JOIN directories d ON d.id = rp.directory_id
                    GROUP BY rp.directory_id, d.name
                   """)
        result = self.db.execute(sql, {"user_id": user_id, "directory_id": directory_id})
        return result.mappings().first()

    def has_permission_for_directory(self, directory_id, user_id) -> bool:
        sql = text("""
                    WITH ugroups AS (SELECT gm.group_id
                                     FROM group_members gm
                                     WHERE gm.user_id = :user_id
                    )
                    SELECT id
                    FROM permissions
                    WHERE (group_id IN (SELECT group_id FROM ugroups)
                    OR user_id = :user_id)
                    AND directory_id = :directory_id
                   """)
        result = self.db.execute(sql, {"user_id": user_id, "directory_id": directory_id})
        return bool(result.first())

    def get_all_user_directory_permissions(self, user_id: int, user_group_ids: list[int]) -> list[int]:
        dir_ids = (
            self.db.query(Permissions.directory_id)
            .filter(
                or_(
                    Permissions.user_id == user_id,
                    Permissions.group_id.in_(user_group_ids)
                ),
                Permissions.directory_id.isnot(None)
            )
            .distinct()
            .all()
        )
        return [dir_id[0] for dir_id in dir_ids]

    def get_all_user_document_permissions(self, user_id, user_group_ids) -> list[int]:
        dir_ids = (
            self.db.query(Permissions.document_id)
            .filter(
                or_(
                    Permissions.user_id == user_id,
                    Permissions.group_id.in_(user_group_ids)
                ),
                Permissions.document_id.isnot(None)
            )
            .distinct()
            .all()
        )
        return [dir_id[0] for dir_id in dir_ids]


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

