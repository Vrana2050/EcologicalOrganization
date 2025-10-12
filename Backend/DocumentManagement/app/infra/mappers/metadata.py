from app.api.dtos.metadata import CreateMetadataDTO, MetadataDTO, MetadataValueCreateDTO
from app.domain.metadata import CustomMetadata, MetadataType, CustomMetadataValue
from app.infra.tables import CustomMetadatas, CustomMetadataValues


def create_metadata_dto_to_domain(dto: CreateMetadataDTO) -> CustomMetadata:
    return CustomMetadata(
        id=None,
        name=dto.name,
        metadata_type=MetadataType(dto.metadata_type),
        description=dto.description
    )

def metadata_domain_to_db(domain: CustomMetadata) -> CustomMetadatas:
    return CustomMetadatas(
        name=domain.name,
        metadata_type=domain.metadata_type,
        description=domain.description
    )

def metadata_db_to_domain(db_metadata: CustomMetadatas) -> CustomMetadata:
    return CustomMetadata(
        id=db_metadata.id,
        name=db_metadata.name,
        metadata_type=MetadataType(db_metadata.metadata_type),
        description=db_metadata.description
    )

def metadata_domain_to_dto(domain: CustomMetadata) -> MetadataDTO:
    return MetadataDTO(
        id=domain.id,
        name=domain.name,
        metadata_type=domain.metadata_type.value,
        description=domain.description
    )

def metadata_dto_to_domain(dto: MetadataDTO) -> CustomMetadata:
    return CustomMetadata(
        id=dto.id,
        name=dto.name,
        metadata_type=MetadataType(dto.metadata_type),
        description=dto.description
    )

def metadata_value_create_dto_to_db(dto: MetadataValueCreateDTO) -> CustomMetadataValues:
    return CustomMetadataValues(
        value=dto.value,
        directory_id=dto.directory_id,
        document_id=dto.document_id,
        is_missing_value=False if dto.value else True,
        custom_metadata_id=dto.metadata_id
    )

def custom_metadata_value_from_db(db_value: CustomMetadataValues) -> CustomMetadataValue:
    return CustomMetadataValue(
        id=db_value.id,
        value=db_value.value,
        is_missing_value=db_value.is_missing_value,
        directory_id=db_value.directory_id,
        document_id=db_value.document_id,
        metadata_rule_id=db_value.metadata_rule_id,
        custom_metadata=metadata_db_to_domain(db_value.custom_metadata) if db_value.custom_metadata else None
    )

