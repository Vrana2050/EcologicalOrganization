package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.StatusTransitionDto;
import com.ekoloskaorg.pr.models.StatusTransition;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface StatusTransitionMapper extends BaseMapper<StatusTransition, StatusTransitionDto> {

    @Mapping(target = "projectId",   source = "project.id")
    @Mapping(target = "fromStatusId", source = "fromStatus.id")
    @Mapping(target = "toStatusId",   source = "toStatus.id")
    StatusTransitionDto toDto(StatusTransition entity);

    @Mapping(target = "project",    ignore = true)
    @Mapping(target = "fromStatus", ignore = true)
    @Mapping(target = "toStatus",   ignore = true)
    StatusTransition toEntity(StatusTransitionDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project",    ignore = true)
    @Mapping(target = "fromStatus", ignore = true)
    @Mapping(target = "toStatus",   ignore = true)
    void updateEntityFromDto(StatusTransitionDto dto, @MappingTarget StatusTransition entity);
}