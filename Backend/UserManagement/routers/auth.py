from datetime import timedelta, datetime, timezone
from typing import Annotated, Dict, List, Optional

import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status

from models import UserRoles
from database import SessionLocal
from models import Users
from passlib.context import CryptContext
from jose import jwt, JWTError
from enum import Enum

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = '703aab59d4ad3d882aa06b6555553c4c98906b2a552ede370417b115c786b628'
ALGORITHM = 'HS256'

DM_URL_ADD_SHARED = "http://127.0.0.1:8000//api/directory/create-shared"

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

class UserRole(str, Enum):
    MANAGER = "MANAGER"
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"

class Subsystem(str, Enum):
    DM = "DM"
    DP = "DP"
    PM = "PM"
    WA = "WA"

class CreateUserRequest(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str
    roles: Dict[Subsystem,UserRole]



class Token(BaseModel):
    access_token: str
    token_type: str

class TokenWithSubsystems(BaseModel):
    access_token: str
    token_type: str
    roles: List[str]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def authenticate_user(email: str, password: str, db):
    user = db.query(Users).filter(Users.email == email).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password) or not user.is_active:
        return False
    return user


def create_access_token(email: str, user_id: int, expires_delta: timedelta, role: str = "NO_ROLE"):

    encode ={'sub': email, 'id': user_id, 'role': role}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        user_id: int = payload.get('id')
        user_role: str = payload.get('role')
        if email is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Could not validate user')
        return {'email': email, 'id': user_id, 'user_role': user_role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user')


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


@router.post("/register-account", status_code=status.HTTP_201_CREATED)
async def create_user(
    db: db_dependency,
    user: user_dependency,
    create_user_request: CreateUserRequest
):

    if user.get('user_role') != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Only admin can register users'
        )

    existing_user = db.query(Users).filter(Users.email == create_user_request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )

    allowed_subsystems = {s.value for s in Subsystem}
    allowed_roles = {r.value for r in UserRole}

    missing_subsystems = allowed_subsystems - set(create_user_request.roles.keys())
    if missing_subsystems:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing roles for subsystems: {', '.join(missing_subsystems)}"
        )

    for subsystem, role in create_user_request.roles.items():
        if subsystem not in allowed_subsystems:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid subsystem: {subsystem}"
            )

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role '{role}' for subsystem {subsystem}"
            )

        if role == UserRole.ADMIN.value and subsystem != Subsystem.WA.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ADMIN role is only allowed for WA subsystem"
            )

    create_user_model = Users(
        email=create_user_request.email,
        first_name=create_user_request.first_name,
        last_name=create_user_request.last_name,
        password=bcrypt_context.hash(create_user_request.password),
        is_active=True,
        since=datetime.now(timezone.utc),
    )
    db.add(create_user_model)
    db.flush()


    for subsystem, role in create_user_request.roles.items():
        db.add(UserRoles(
            user_id=create_user_model.id,
            role=role.value,
            subsystem=subsystem
        ))
        if subsystem == Subsystem.DM and role == UserRole.EMPLOYEE:
            response = requests.get(f"{DM_URL_ADD_SHARED}/{create_user_model.id}")
            if response.status_code != 201:
                raise Exception(f"Document Management service error: {response.status_code}")

    db.commit()
    db.refresh(create_user_model)

    return {
        "id": create_user_model.id,
        "email": create_user_model.email,
        "roles": create_user_request.roles
    }



@router.post('/login')
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user')

    # user_roles = db.query(UserRoles).filter(
    #     UserRoles.user_id == user.id
    # ).all()
    #
    # available_subsystems = [u.subsystem for u in user_roles]

    token = create_access_token(user.email, user.id, timedelta(minutes=20))
    return {'access_token': token, 'token_type': 'bearer'}


@router.get('/login_to_subsystem/{subsystem}', response_model=Token)
async def login_to_subsystem(db: db_dependency,
                                 user: user_dependency,
                                 subsystem: str):

    if subsystem not in {s.value for s in Subsystem}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Invalid subsystem')

    user_role = db.query(UserRoles).filter(
        UserRoles.user_id == user.get("id"),
        UserRoles.subsystem == subsystem
    ).first()

    if not user_role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='User not found in chosen subsystem')

    token = create_access_token(user.get('email'), user.get('id'), timedelta(minutes=20), role=user_role.role)
    return {'access_token': token, 'token_type': 'bearer'}


@router.post('/token', response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):

    user = authenticate_user(form_data.username, form_data.password, db)
    print(user)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user')

    token = create_access_token(user.email, user.id, timedelta(minutes=20), role='ADMIN')
    return {'access_token': token, 'token_type': 'bearer'}


@router.get('/user-credentials')
async def get_user_credentials(user: user_dependency):
    return {'email': user.get('email'), 'id': user.get('id'), 'role': user.get('user_role')}


class ReadUser(BaseModel):
    id: int
    email: str
    role: UserRole

@router.get('/user-by-email/{subsystem}/{user_email}', response_model=ReadUser)
async def get_user_by_email(user_email: str, subsystem: str, db: db_dependency):
    user = db.query(Users).filter(Users.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail='User doesnt exist')
    role = db.query(UserRoles).filter(UserRoles.user_id == user.id, UserRoles.subsystem == subsystem).first()

    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail='User doesnt exist')

    return ReadUser(id=user.id, email=user.email, role=role.role)



@router.get('/user-by-id/{subsystem}/{user_id}', response_model=ReadUser)
async def get_user_by_id(user_id: int, subsystem: str, db: db_dependency):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail='User doesnt exist')
    role = db.query(UserRoles).filter(UserRoles.user_id == user.id, UserRoles.subsystem == subsystem).first()

    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail='User doesnt exist')

    return ReadUser(id=user.id, email=user.email, role=role.role)


class Managers(BaseModel):
    manager_ids: List[int]

@router.get('/managers/{subsystem}', status_code=200, response_model=Managers)
async def get_all_managers(db: db_dependency, subsystem: str):
    if subsystem not in {s.value for s in Subsystem}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail='Invalid subsystem')

    managers = db.query(UserRoles).filter(UserRoles.subsystem == subsystem,
                                          UserRoles.role == UserRole.MANAGER).all()

    return Managers(manager_ids=[m.user_id for m in managers])
