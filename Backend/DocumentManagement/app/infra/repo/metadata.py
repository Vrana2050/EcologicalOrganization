from typing import Optional

from app.domain.metadata import CustomMetadata
from app.infra.mappers.metadata import metadata_domain_to_db, metadata_db_to_domain
from app.infra.tables import CustomMetadatas


class MetadataRepository:
    def __init__(self, db):
        self.db = db

    def save(self, metadata: CustomMetadata) -> CustomMetadata:
        db_metadata = metadata_domain_to_db(metadata)
        self.db.add(db_metadata)
        self.db.commit()
        self.db.refresh(db_metadata)
        return metadata_db_to_domain(db_metadata)

    def get_all(self) -> list[CustomMetadata]:
        db_metadata_list = self.db.query(CustomMetadatas).all()
        return [metadata_db_to_domain(m) for m in db_metadata_list]

    def get_by_id(self, metadata_id: int) -> Optional[CustomMetadata]:
        db_metadata = self.db.query(CustomMetadatas).filter(CustomMetadatas.id == metadata_id).first()
        return metadata_db_to_domain(db_metadata) if db_metadata else None

    def get_by_name(self, name: str) -> Optional[CustomMetadata]:
        db_metadata = self.db.query(CustomMetadatas).filter(CustomMetadatas.name == name).first()
        return metadata_db_to_domain(db_metadata) if db_metadata else None

    def update(self, metadata: CustomMetadata) -> Optional[CustomMetadata]:
        db_metadata = self.db.query(CustomMetadatas).filter(CustomMetadatas.id == metadata.id).first()
        if not db_metadata:
            return None

        db_metadata.name = metadata.name
        db_metadata.metadata_type = metadata.metadata_type
        db_metadata.description = metadata.description

        self.db.commit()
        self.db.refresh(db_metadata)
        return metadata_db_to_domain(db_metadata)

    def delete(self, metadata_id: int) -> bool:
        db_metadata = self.db.query(CustomMetadatas).filter(CustomMetadatas.id == metadata_id).first()
        if not db_metadata:
            return False

        self.db.delete(db_metadata)
        self.db.commit()
        return True
