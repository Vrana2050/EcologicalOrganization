from fastapi import Depends
from app.core.security import get_user_from_headers


def get_current_user(user=Depends(get_user_from_headers)):
    return user

