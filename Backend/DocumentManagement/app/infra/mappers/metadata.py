from app.api.dtos.metadata import CreateMetadataDTO, MetadataDTO
from app.domain.metadata import CustomMetadata, MetadataType
from app.infra.tables import CustomMetadatas



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
