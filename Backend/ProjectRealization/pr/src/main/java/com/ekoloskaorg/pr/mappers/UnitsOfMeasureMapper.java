package com.ekoloskaorg.pr.mappers;

import com.ekoloskaorg.pr.dtos.UnitsOfMeasureDto;
import com.ekoloskaorg.pr.models.UnitsOfMeasure;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;


@Mapper(componentModel = "spring")
public interface UnitsOfMeasureMapper extends BaseMapper<UnitsOfMeasure,UnitsOfMeasureDto>{
    UnitsOfMeasureDto toDto(UnitsOfMeasure entity);
    UnitsOfMeasure toEntity(UnitsOfMeasureDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(UnitsOfMeasureDto dto, @MappingTarget UnitsOfMeasure entity);

}
