from dataclasses import dataclass

import requests

from app.core.exceptions import http_404

AUTH_URL_EMAIL = "http://localhost:8081/auth/user-by-email/DM"
AUTH_URL_ID = "http://localhost:8081/auth/user-by-id/DM"
AUTH_URL_MANAGERS = "http://localhost:8081/auth/managers/DM"

@dataclass
class User:
    id: int
    email: str
    role: str


def get_user_by_id(user_id: int) -> User:
    response = requests.get(f"{AUTH_URL_ID}/{user_id}")
    if response.status_code == 404:
        raise http_404(f"User with id '{user_id}' does not exist")
    elif response.status_code != 200:
        raise Exception(f"Auth service error: {response.status_code}")

    user_data = response.json()
    return User(**user_data)


def get_user_by_email(user_email: str) -> User:
    response = requests.get(f"{AUTH_URL_EMAIL}/{user_email}")
    if response.status_code == 404:
        raise http_404(f"User '{user_email}' does not exist")
    elif response.status_code != 200:
        raise Exception(f"Auth service error: {response.status_code}")

    user_data = response.json()
    return User(**user_data)

def get_all_managers() -> list[int]:
    response = requests.get(AUTH_URL_MANAGERS)
    if response.status_code != 200:
        raise Exception(f"Auth service error: {response.status_code}")

    manager_data = response.json()
    return manager_data["manager_ids"]


