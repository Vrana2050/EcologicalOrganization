package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.LogDto;
import com.ekoloskaorg.pr.models.Log;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface LogMapper extends BaseMapper<Log, LogDto> {

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "memberId",  source = "member.id")
    @Mapping(target = "taskId",    source = "task.id")
    LogDto toDto(Log entity);

    @Mapping(target = "project", ignore = true)
    @Mapping(target = "member",  ignore = true)
    @Mapping(target = "task",    ignore = true)
    Log toEntity(LogDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "member",  ignore = true)
    @Mapping(target = "task",    ignore = true)
    void updateEntityFromDto(LogDto dto, @MappingTarget Log entity);
}