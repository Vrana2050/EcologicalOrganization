package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.TaskResourceDto;
import com.ekoloskaorg.pr.models.TaskResource;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TaskResourceMapper extends BaseMapper<TaskResource, TaskResourceDto> {

    @Mapping(target = "taskId",     source = "task.id")
    @Mapping(target = "resourceId", source = "resource.id")
    TaskResourceDto toDto(TaskResource entity);

    @Mapping(target = "task",     ignore = true)
    @Mapping(target = "resource", ignore = true)
    TaskResource toEntity(TaskResourceDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "task",     ignore = true)
    @Mapping(target = "resource", ignore = true)
    void updateEntityFromDto(TaskResourceDto dto, @MappingTarget TaskResource entity);
}