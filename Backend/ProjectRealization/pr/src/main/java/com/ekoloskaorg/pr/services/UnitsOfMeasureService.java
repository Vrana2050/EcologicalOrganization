package com.ekoloskaorg.pr.services;


import com.ekoloskaorg.pr.dtos.UnitsOfMeasureDto;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.mappers.UnitsOfMeasureMapper;
import com.ekoloskaorg.pr.models.UnitsOfMeasure;
import com.ekoloskaorg.pr.repositories.UnitsOfMeasureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class UnitsOfMeasureService extends AbstractCrudService<UnitsOfMeasure,Long, UnitsOfMeasureDto> {
    private final UnitsOfMeasureRepository repo;
    private final UnitsOfMeasureMapper mapper;

    @Override protected JpaRepository<UnitsOfMeasure, Long> repo() { return repo; }
    @Override protected BaseMapper<UnitsOfMeasure, UnitsOfMeasureDto> mapper() { return mapper; }
}
