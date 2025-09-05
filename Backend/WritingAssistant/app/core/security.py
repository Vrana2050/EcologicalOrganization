from fastapi import Request, HTTPException, status
from pydantic import BaseModel

class CurrentUser(BaseModel):
    id: int
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None

async def get_user_id_from_headers(request: Request) -> int:
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing x-user-id header",
        )
    try:
        return int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid x-user-id header",
        )

async def get_user_from_headers(request: Request) -> CurrentUser:
    user_id = await get_user_id_from_headers(request)
    email = request.headers.get("x-user-email")
    first_name = request.headers.get("x-user-first-name")
    last_name = request.headers.get("x-user-last-name")

    return CurrentUser(
        id=user_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
