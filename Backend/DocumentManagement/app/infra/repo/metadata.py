from typing import Optional

from app.api.dtos.metadata import MetadataValueCreateDTO
from app.domain.metadata import CustomMetadata, CustomMetadataValue
from app.infra.mappers.metadata import metadata_domain_to_db, metadata_db_to_domain, custom_metadata_value_from_db, \
    metadata_value_create_dto_to_db
from app.infra.tables import CustomMetadatas, CustomMetadataValues


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

        type_changed = db_metadata.metadata_type != metadata.metadata_type

        db_metadata.name = metadata.name
        db_metadata.metadata_type = metadata.metadata_type
        db_metadata.description = metadata.description

        if type_changed:
            values = self.find_metadata_value_for_metadata(db_metadata.id)
            for val in values:
                val.value = None
                val.is_missing_value = True

        self.db.commit()
        self.db.refresh(db_metadata)
        return metadata_db_to_domain(db_metadata)

    def find_metadata_value_for_metadata(self, metadata_id: int):
        return self.db.query(CustomMetadataValues).filter(CustomMetadataValues.custom_metadata_id == metadata_id).all()

    def delete(self, metadata_id: int) -> bool:
        db_metadata = self.db.query(CustomMetadatas).filter(CustomMetadatas.id == metadata_id).first()
        if not db_metadata:
            return False

        self.db.delete(db_metadata)
        self.db.commit()
        return True

    def get_metadata_by_ids(self, metadata_ids: set[int]) -> list[CustomMetadata]:
        return [
            metadata_db_to_domain(m)
            for m in self.db.query(CustomMetadatas)
            .filter(CustomMetadatas.id.in_(metadata_ids))
            .all()
        ]

    def get_metavalues_by_metadata_ids_for_document(self, metadata_ids, document_id) -> list[CustomMetadataValue]:
        return [
            custom_metadata_value_from_db(m)
            for m in self.db.query(CustomMetadataValues)
            .filter(CustomMetadataValues.custom_metadata_id.in_(metadata_ids),
                    CustomMetadataValues.document_id == document_id)
            .all()
        ]

    def update_metadata_value(self, metavalue_id, value):
        db_metadata = self.db.query(CustomMetadataValues).filter(CustomMetadataValues.id == metavalue_id).first()

        db_metadata.value = value

        self.db.commit()
        self.db.refresh(db_metadata)


    def add_metadata_value(self, new_value: MetadataValueCreateDTO):
        self.db.add(metadata_value_create_dto_to_db(new_value))

    def delete_metavalues_for_document(self, document_id):
        (
            self.db.query(CustomMetadataValues)
            .filter(CustomMetadataValues.document_id == document_id)
            .delete(synchronize_session=False)
        )

    def delete_metavalues_for_directory(self, directory_id):
        (
            self.db.query(CustomMetadataValues)
            .filter(CustomMetadataValues.directory_id == directory_id)
            .delete(synchronize_session=False)
        )
