package com.ekoloskaorg.pr.services;


import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.ResourceDto;
import com.ekoloskaorg.pr.mappers.ResourceMapper;
import com.ekoloskaorg.pr.models.Resource;
import com.ekoloskaorg.pr.models.UnitsOfMeasure;
import com.ekoloskaorg.pr.repositories.ResourceRepository;
import com.ekoloskaorg.pr.repositories.UnitsOfMeasureRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResourceService extends AbstractCrudService<Resource, Long, ResourceDto> {

    private final ResourceRepository repo;
    private final ResourceMapper mapper;
    private final UnitsOfMeasureRepository units;

    @Override protected JpaRepository<Resource, Long> repo() { return repo; }
    @Override protected BaseMapper<Resource, ResourceDto> mapper() { return mapper; }

    @Override protected void beforeCreate(ResourceDto dto, Resource e) { wire(dto, e); }
    @Override protected void beforeUpdate(ResourceDto dto, Resource e) { wire(dto, e); }

    private void wire(ResourceDto dto, Resource e) {
        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("Resource.name is required");
        }
        if (dto.unitOfMeasureId() == null) {
            throw new IllegalArgumentException("unitOfMeasureId is required");
        }
        UnitsOfMeasure uom = units.findById(dto.unitOfMeasureId())
                .orElseThrow(() -> new EntityNotFoundException("UnitOfMeasure %d not found".formatted(dto.unitOfMeasureId())));
        e.setUnitOfMeasure(uom);
    }


}