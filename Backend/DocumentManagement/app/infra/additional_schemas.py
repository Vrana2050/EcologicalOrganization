from pydantic import BaseModel
from datetime import datetime

class SubdirectorySchema(BaseModel):
    id: int
    directory_id: int
    access_type: str
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int

    class Config:
        orm_mode = True

class SubdocumentSchema(BaseModel):
    id: int
    document_id: int
    access_type: str
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int

    class Config:
        orm_mode = True



class CurrentPermission(BaseModel):
    directory_id: int
    name: str
    access_type: str

    class Config:
        orm_mode = True


class SubdirectoryWithTagsSchema(BaseModel):
    id: int
    directory_id: int
    access_type: str
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int
    tags: list[str]

    class Config:
        orm_mode = True


class SubdocumentWithTagsSchema(BaseModel):
    id: int
    document_id: int
    access_type: str
    name: str
    created_at: datetime
    last_modified: datetime
    creator_id: int
    tags: list[str]

    class Config:
        orm_mode = True


class DirectoryOpenResponse(BaseModel):
    current_permission: CurrentPermission | None
    subdirectories: list[SubdirectoryWithTagsSchema]
    subdocuments: list[SubdocumentWithTagsSchema]
    path: list[dict]  # ili možeš napraviti poseban PathItem model


def map_subdirectory_with_tags(subdir: SubdirectorySchema, tags: list[str]) -> SubdirectoryWithTagsSchema:
    return SubdirectoryWithTagsSchema(
        id=subdir.id,
        directory_id=subdir.directory_id,
        access_type=subdir.access_type,
        name=subdir.name,
        created_at=subdir.created_at,
        last_modified=subdir.last_modified,
        creator_id=subdir.creator_id,
        tags=tags,
    )


def map_subdocument_with_tags(subdoc: SubdocumentSchema, tags: list[str]) -> SubdocumentWithTagsSchema:
    return SubdocumentWithTagsSchema(
        id=subdoc.id,
        document_id=subdoc.document_id,
        access_type=subdoc.access_type,
        name=subdoc.name,
        created_at=subdoc.created_at,
        last_modified=subdoc.last_modified,
        creator_id=subdoc.creator_id,
        tags=tags,
    )
