package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.TemplateDto;
import com.ekoloskaorg.pr.models.Template;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TemplateMapper extends BaseMapper<Template, TemplateDto> {

    @Mapping(target = "projectId", source = "project.id")
    TemplateDto toDto(Template entity);

    @Mapping(target = "project", ignore = true)
    Template toEntity(TemplateDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project", ignore = true)
    void updateEntityFromDto(TemplateDto dto, @MappingTarget Template entity);
}