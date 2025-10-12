from sqlalchemy.orm.session import Session
from app.domain.user_group import UserGroup
from app.infra.mappers.user_groups import user_group_db_to_domain, user_group_domain_to_db
from app.infra.tables import GroupMembers, UserGroups


class UserGroupRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[UserGroup] | None:
        return [user_group_db_to_domain(user_group) for user_group in self.db.query(UserGroups).all()]


    def save(self, user_group: UserGroup) -> UserGroup:
        db_obj = user_group_domain_to_db(user_group)

        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        return user_group_db_to_domain(db_obj)


    def get_group_by_id(self, group_id: int) -> UserGroup | None:
        db_obj = self.db.query(UserGroups).filter(UserGroups.id == group_id).first()
        if db_obj is None:
            return None
        return user_group_db_to_domain(db_obj)




    def get_group_by_name(self, name: str) -> UserGroup | None:
        db_obj = self.db.query(UserGroups).filter(UserGroups.name == name).first()
        if db_obj is None:
            return None
        return user_group_db_to_domain(db_obj)


    def add_user_to_group(self, group_id: int, user_id: int) -> UserGroup:
        self.db.add(GroupMembers(user_id=user_id, group_id=group_id))
        self.db.commit()

        return user_group_db_to_domain(self.db.query(UserGroups).filter(UserGroups.id == group_id).first())

    def remove_member_from_group(self, group_id: int, user_id: int) -> None:
        self.db.delete(self.db.query(GroupMembers)
            .filter(GroupMembers.user_id == user_id, GroupMembers.group_id == group_id)
            .first())
        self.db.commit()

    def get_groups_for_user(self, user_id) -> list[UserGroup]:
        groups = (
            self.db.query(UserGroups)
            .join(GroupMembers, GroupMembers.group_id == UserGroups.id)
            .filter(GroupMembers.user_id == user_id)
            .all()
        )

        return [user_group_db_to_domain(group) for group in groups]

    def get_groups_by_ids(self, group_ids):
        groups = self.db.query(UserGroups).filter(UserGroups.id.in_(group_ids)).all()

        return [user_group_db_to_domain(group) for group in groups]

    def delete(self, group_id):
        self.db.delete(self.db.query(UserGroups).filter(UserGroups.id == group_id).first())
        self.db.commit()

    def get_group_ids_for_user(self, user_id: int) -> list[int]:
        group_ids = (
            self.db.query(GroupMembers.group_id)
            .filter(GroupMembers.user_id == user_id)
            .all()
        )
        return [group_id[0] for group_id in group_ids]
