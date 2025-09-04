from fastapi import Request, HTTPException, status

# Ovo je tvoj "dependency" koji umesto JWT-a čita headere
async def get_user_from_headers(request: Request):
    user_id = request.headers.get("x-user-id")
    email = request.headers.get("x-user-email")
    first_name = request.headers.get("x-user-first-name")
    last_name = request.headers.get("x-user-last-name")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication headers",
        )

    # Možeš vratiti dict ili Pydantic model (bolje)
    return {
        "id": int(user_id),
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
    }
