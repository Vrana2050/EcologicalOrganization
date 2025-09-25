package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.MemberDto;
import com.ekoloskaorg.pr.models.Member;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MemberMapper extends BaseMapper<Member, MemberDto> {

    @Mapping(target = "projectId", source = "project.id")
    MemberDto toDto(Member entity);

    @Mapping(target = "project", ignore = true)
    Member toEntity(MemberDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project", ignore = true)
    void updateEntityFromDto(MemberDto dto, @MappingTarget Member entity);
}