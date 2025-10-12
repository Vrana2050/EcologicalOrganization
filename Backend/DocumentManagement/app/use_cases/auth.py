from dataclasses import dataclass

import requests

from app.core.exceptions import http_404

USER_MANAGEMENT_URL = "http://localhost:8081/auth"
AUTH_URL_EMAIL = f"{USER_MANAGEMENT_URL}/user-by-email/DM"
AUTH_URL_ID = f"{USER_MANAGEMENT_URL}/user-by-id/DM"
AUTH_URL_MANAGERS = f"{USER_MANAGEMENT_URL}/managers/DM"
AUTH_USERS_BY_IDS = f"{USER_MANAGEMENT_URL}/users-by-ids"

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

def get_users_by_ids(user_ids: list[int]) -> dict[int, str]:
    response = requests.post(
        AUTH_USERS_BY_IDS,
        json={"user_ids": user_ids}
    )

    if response.status_code != 200:
        raise Exception(f"Auth service error: {response.status_code}")

    return response.json()



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


