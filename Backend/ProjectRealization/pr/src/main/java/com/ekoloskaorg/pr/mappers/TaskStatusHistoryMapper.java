package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.TaskStatusHistoryDto;
import com.ekoloskaorg.pr.models.TaskStatusHistory;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TaskStatusHistoryMapper extends BaseMapper<TaskStatusHistory, TaskStatusHistoryDto> {

    @Mapping(target = "taskId",   source = "task.id")
    @Mapping(target = "statusId", source = "status.id")
    TaskStatusHistoryDto toDto(TaskStatusHistory entity);

    @Mapping(target = "task",   ignore = true)
    @Mapping(target = "status", ignore = true)
    TaskStatusHistory toEntity(TaskStatusHistoryDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "task",   ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntityFromDto(TaskStatusHistoryDto dto, @MappingTarget TaskStatusHistory entity);
}