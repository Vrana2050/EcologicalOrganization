package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.TaskDto;
import com.ekoloskaorg.pr.models.Task;
import org.mapstruct.*;


@Mapper(componentModel = "spring")
public interface TaskMapper extends BaseMapper<Task, TaskDto> {

    @Mapping(target = "projectId",        source = "project.id")
    @Mapping(target = "statusId",         source = "status.id")
    @Mapping(target = "assignedMemberId", source = "assignedMember.id")
    TaskDto toDto(Task entity);


    @Mapping(target = "project",        ignore = true)
    @Mapping(target = "status",         ignore = true)
    @Mapping(target = "assignedMember", ignore = true)
    Task toEntity(TaskDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project",        ignore = true)
    @Mapping(target = "status",         ignore = true)
    @Mapping(target = "assignedMember", ignore = true)
    void updateEntityFromDto(TaskDto dto, @MappingTarget Task entity);
}