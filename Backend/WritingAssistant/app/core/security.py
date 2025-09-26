from fastapi import Request, HTTPException, status
from pydantic import BaseModel


class CurrentUser(BaseModel):
    id: int
    email: str | None = None
    role: str | None = None


async def get_user_id_from_headers(request: Request) -> int:
    user_id = request.headers.get("X-USER-ID")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-USER-ID header",
        )
    try:
        return int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-USER-ID header",
        )


async def get_user_from_headers(request: Request) -> CurrentUser:
    user_id = await get_user_id_from_headers(request)
    email = request.headers.get("X-EMAIL")
    role = request.headers.get("X-USER-ROLE")

    return CurrentUser(
        id=user_id,
        email=email,
        role=role,
    )
