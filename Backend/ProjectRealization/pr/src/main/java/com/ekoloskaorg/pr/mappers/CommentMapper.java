package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.CommentDto;
import com.ekoloskaorg.pr.models.Comment;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CommentMapper extends BaseMapper<Comment, CommentDto> {

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "taskId",    source = "task.id")
    @Mapping(target = "memberId",  source = "member.id")
    CommentDto toDto(Comment entity);

    @Mapping(target = "project", ignore = true)
    @Mapping(target = "task",    ignore = true)
    @Mapping(target = "member",  ignore = true)
    Comment toEntity(CommentDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "task",    ignore = true)
    @Mapping(target = "member",  ignore = true)
    void updateEntityFromDto(CommentDto dto, @MappingTarget Comment entity);
}