from typing import Optional

from app.api.dtos.metadata import MetadataValueCreateDTO
from app.core.exceptions import http_409, http_400, http_404
from app.domain.metadata import CustomMetadata, MetadataType, CustomMetadataValue
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
            raise http_404(f"Metadata '{metadata.name}' not found")
        return self.metadata_repo.update(metadata)

    def delete_metadata(self, metadata_id: int) -> bool:
        return self.metadata_repo.delete(metadata_id)

    def get_metadata_by_ids(self, metadata_ids: set[int]) -> list[CustomMetadata]:
        return self.metadata_repo.get_metadata_by_ids(metadata_ids)

    def get_metavalues_by_metadata_ids_for_document(self, metadata_ids, document_id) -> list[CustomMetadataValue]:
        return self.metadata_repo.get_metavalues_by_metadata_ids_for_document(metadata_ids, document_id)

    def update_metadata_value(self, metavalue_id, value):
        return self.metadata_repo.update_metadata_value(metavalue_id, value)

    def add_metadata_value(self, new_metadata_value: MetadataValueCreateDTO):
        return self.metadata_repo.add_metadata_value(new_metadata_value)

    def delete_metavalues_for_document(self, document_id):
        return self.metadata_repo.delete_metavalues_for_document(document_id)

    def delete_metavalues_for_directory(self, directory_id):
        return self.metadata_repo.delete_metavalues_for_directory(directory_id)

