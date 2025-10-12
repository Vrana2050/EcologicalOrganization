from typing import List

from cx_Oracle import SessionPool
from fastapi import APIRouter, status, Depends
from sqlalchemy.orm.session import Session

from app.api.dependencies.headers import get_user_headers
from app.api.dependencies.services import  get_tag_service
from app.api.dtos.tags import create_tag_dto_to_domain, CreateTagDTO, TagDTO, tag_domain_to_dto, tag_dto_to_domain
from app.core.exceptions import http_401, http_404
from app.infra.database import get_db
from app.use_cases.tag import TagService
from app.use_cases.elastic_search_client import maintenance as es_maintenance_service

router = APIRouter(tags=["Tags"])


@router.post('/', status_code=status.HTTP_201_CREATED)
async def upload(new_tag: CreateTagDTO,
                 user=Depends(get_user_headers),
                 db: Session = Depends(get_db),
                 service: TagService = Depends(get_tag_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can handle tags")

    try:
        service.create_tag(create_tag_dto_to_domain(new_tag))
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

@router.get("/", response_model=List[TagDTO])
async def get_all(user=Depends(get_user_headers),
                  service: TagService = Depends(get_tag_service)):

    # if user.role not in ["MANAGER"]:
    #     raise http_401("Not authorized to view tags")

    tags = service.get_all_tags()
    return [tag_domain_to_dto(t) for t in tags] if tags else []


@router.get("/{tag_id}", response_model=TagDTO)
async def get_by_id(tag_id: int,
                    user=Depends(get_user_headers),
                    service: TagService = Depends(get_tag_service)):

    if user.role not in ["MANAGER", "EMPLOYEE"]:
        raise http_401("Not authorized to view tags")

    tag = service.get_tag_by_id(tag_id)
    if not tag:
        raise http_404("Tag not found")

    return tag_domain_to_dto(tag)


@router.put("/", response_model=TagDTO)
async def update(tag: TagDTO,
                 user=Depends(get_user_headers),
                 service: TagService = Depends(get_tag_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can update tags")

    updated = service.update_tag(tag_dto_to_domain(tag))
    if not updated:
        raise http_404("Tag not found")

    return tag_domain_to_dto(updated)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(tag_id: int,
                 user=Depends(get_user_headers),
                 service: TagService = Depends(get_tag_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can delete tags")

    deleted = service.delete_tag(tag_id)
    if not deleted:
        raise http_404("Tag not found")
    es_maintenance_service.delete_tag(tag_id)
