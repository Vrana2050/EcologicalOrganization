from app.core.exceptions import http_409, http_404, http_400
from app.domain.user_group import UserGroup
from app.infra.repo.user_groups import UserGroupRepository
from .auth import get_user_by_email, get_user_by_id, get_users_by_ids
from ..api.dtos.user_group import UserGroupReadDTO, GroupMemberDTO


class UserGroupService:

    def __init__(self, user_group_repo: UserGroupRepository):
        self.user_group_repo = user_group_repo

    def get_user_group_by_id(self, group_id: int) -> UserGroup | None:
        return self.user_group_repo.get_group_by_id(group_id)

    def get_group_with_user_emails(self, group_id: int) -> UserGroupReadDTO | None:
        group = self.get_user_group_by_id(group_id)
        if not group:
            raise http_404("Group not found")
        group_with_members = UserGroupReadDTO(id=group.id, name=group.name, description=group.description)
        users = get_users_by_ids(group.members)
        for user_id, user_email in users.items():
            group_with_members.members.append(GroupMemberDTO(id=user_id, email=user_email))

        return group_with_members

    def get_user_group_by_name(self, name: str) -> UserGroup | None:
        return self.user_group_repo.get_group_by_name(name)

    def get_all_user_groups(self) -> list[UserGroup] | None:
        return self.user_group_repo.get_all()


    def create_user_group(self, user_group: UserGroup) -> UserGroup:
        if self.get_user_group_by_name(user_group.name):
            raise http_409(f"User group named '{user_group.name}' already exists")

        return self.user_group_repo.save(user_group)


    def add_member(self, group_id, user_email) -> UserGroup:
        if not self.get_user_group_by_id(group_id):
            raise http_404(f"User group '{group_id}' does not exist")

        user = get_user_by_email(user_email)

        if self.is_member_of_group(group_id, user.id):
            raise http_400(f"'{user_email}' is already a part of group")

        return self.user_group_repo.add_user_to_group(group_id, user.id)

    def remove_member(self, group_id, member_id) -> None:
        if not self.get_user_group_by_id(group_id):
            raise http_404(f"User group '{group_id}' does not exist")

        if not self.is_member_of_group(group_id, member_id):
            raise http_400(f"'Member with if '{member_id}' is not a part of group")

        self.user_group_repo.remove_member_from_group(group_id, member_id)


    def is_member_of_group(self, group_id: int, member_id: int) -> bool:
        group = self.get_user_group_by_id(group_id)
        if member_id in group.members:
            return True
        return False

    def get_groups_for_user(self, user_id: int) -> list[UserGroup]:
        return self.user_group_repo.get_groups_for_user(user_id)

    def get_groups_by_ids(self, group_ids):
        return self.user_group_repo.get_groups_by_ids(group_ids)

    def delete_group(self, group_id: int) -> None:
        if not self.get_user_group_by_id(group_id):
            raise http_404(f"User group '{group_id}' does not exist")
        return self.user_group_repo.delete(group_id)

    def get_group_ids_for_user(self, user_id) -> list[int]:
        return self.user_group_repo.get_group_ids_for_user(user_id)