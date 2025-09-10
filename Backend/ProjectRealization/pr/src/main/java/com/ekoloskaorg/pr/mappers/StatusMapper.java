package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.StatusDto;
import com.ekoloskaorg.pr.models.Status;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface StatusMapper extends BaseMapper<Status, StatusDto> {

    @Mapping(target = "projectId", source = "project.id")
    StatusDto toDto(Status entity);

    @Mapping(target = "project", ignore = true)
    Status toEntity(StatusDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project", ignore = true)
    void updateEntityFromDto(StatusDto dto, @MappingTarget Status entity);
}