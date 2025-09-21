from typing import Optional

from app.core.exceptions import http_409, http_400
from app.domain.metadata import CustomMetadata, MetadataType
from app.infra.repo.metadata import MetadataRepository


class MetadataService:
    def __init__(self, metadata_repo: MetadataRepository):
        self.metadata_repo = metadata_repo

    def get_metadata_by_id(self, metadata_id: int) -> Optional[CustomMetadata]:
        return self.metadata_repo.get_by_id(metadata_id)

    def get_metadata_by_name(self, name: str) -> Optional[CustomMetadata]:
        return self.metadata_repo.get_by_name(name)

    def get_all_metadata(self) -> list[CustomMetadata]:
        return self.metadata_repo.get_all()

    def create_metadata(self, metadata: CustomMetadata) -> CustomMetadata:
        if self.get_metadata_by_name(metadata.name):
            raise http_409(f"Metadata '{metadata.name}' already exists")
        return self.metadata_repo.save(metadata)

    def update_metadata(self, metadata: CustomMetadata) -> Optional[CustomMetadata]:
        existing = self.metadata_repo.get_by_id(metadata.id)
        if not existing:
            return None
        if existing.name != metadata.name and self.get_metadata_by_name(metadata.name):
            raise http_409(f"Metadata '{metadata.name}' already exists")
        return self.metadata_repo.update(metadata)

    def delete_metadata(self, metadata_id: int) -> bool:
        return self.metadata_repo.delete(metadata_id)
