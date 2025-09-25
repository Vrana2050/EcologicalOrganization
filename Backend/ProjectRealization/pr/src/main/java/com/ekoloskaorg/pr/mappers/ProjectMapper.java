package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.ProjectDto;
import com.ekoloskaorg.pr.models.Project;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProjectMapper extends BaseMapper<Project, ProjectDto> {

    @Mapping(target = "templateId", source = "template.id")
    ProjectDto toDto(Project entity);

    @Mapping(target = "template", ignore = true)
    Project toEntity(ProjectDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "template", ignore = true)
    void updateEntityFromDto(ProjectDto dto, @MappingTarget Project entity);
}