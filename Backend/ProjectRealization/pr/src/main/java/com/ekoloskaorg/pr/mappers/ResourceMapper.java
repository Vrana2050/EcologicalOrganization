package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.ResourceDto;
import com.ekoloskaorg.pr.models.Resource;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ResourceMapper extends BaseMapper<Resource, ResourceDto> {

    @Mapping(target = "unitOfMeasureId", source = "unitOfMeasure.id")
    ResourceDto toDto(Resource entity);

    @Mapping(target = "unitOfMeasure", ignore = true)
    Resource toEntity(ResourceDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "unitOfMeasure", ignore = true)
    void updateEntityFromDto(ResourceDto dto, @MappingTarget Resource entity);
}
