from typing import Annotated
from fastapi import Header

from app.core.exceptions import http_401


class User:
    def __init__(self, id: int, role: str):
        self.id = id
        self.role = role

async def get_user_headers(
    x_user_id: Annotated[int, Header()],
    x_user_role: Annotated[str, Header()]
) -> User:

    if x_user_id and x_user_id <= 0:
        raise http_401()

    allowed_roles = ["MANAGER", "EMPLOYEE"]
    if x_user_role and x_user_role not in allowed_roles:
        raise http_401()

    return User(id=x_user_id, role=x_user_role)