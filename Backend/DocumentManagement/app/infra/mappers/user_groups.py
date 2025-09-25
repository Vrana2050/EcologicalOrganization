from typing import List, Optional
from app.domain.user_group import GroupMember, UserGroup
from ..tables import GroupMembers, UserGroups


# ---------- DB → Domain ----------

def group_member_db_to_domain(db_obj: GroupMembers) -> GroupMember:
    return GroupMember(
        user_id=db_obj.user_id,
        group_id=db_obj.group_id
    )


def user_group_db_to_domain(db_obj: UserGroups) -> UserGroup:
    return UserGroup(
        id=db_obj.id,
        name=db_obj.name,
        description=db_obj.description,
        members=[
            group_member_db_to_domain(m).user_id for m in db_obj.group_members
        ] if db_obj.group_members else [],
    )


# ---------- Domain → DB ----------

def group_member_domain_to_db(domain_obj: GroupMember) -> GroupMembers:
    return GroupMembers(
        user_id=domain_obj.user_id,
        group_id=domain_obj.group_id
    )


def user_group_domain_to_db(domain_obj: UserGroup) -> UserGroups:
    return UserGroups(
        id=domain_obj.id,
        name=domain_obj.name,
        description=domain_obj.description,
    )
