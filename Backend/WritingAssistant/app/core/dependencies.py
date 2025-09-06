from fastapi import Depends
from app.core.security import get_user_id_from_headers, get_user_from_headers, CurrentUser
from app.core.exceptions import AuthError

async def get_current_user_id(user_id: int = Depends(get_user_id_from_headers)) -> int:
    return user_id

async def get_current_user(user: CurrentUser = Depends(get_user_from_headers)) -> CurrentUser:
    return user

async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "ADMIN":
        raise AuthError(detail="You must be admin")
    return user
