package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.StatusDto;
import com.ekoloskaorg.pr.mappers.StatusMapper;
import com.ekoloskaorg.pr.models.Project;
import com.ekoloskaorg.pr.models.Status;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import com.ekoloskaorg.pr.repositories.StatusRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatusService extends AbstractCrudService<Status, Long, StatusDto> {

    private final StatusRepository repo;
    private final StatusMapper mapper;
    private final ProjectRepository projects;

    @Override protected JpaRepository<Status, Long> repo() { return repo; }
    @Override protected BaseMapper<Status, StatusDto> mapper() { return mapper; }

    @Override protected void beforeCreate(StatusDto dto, Status e) { validate(dto); wire(dto, e); }
    @Override protected void beforeUpdate(StatusDto dto, Status e) { validate(dto); wire(dto, e); }

    private void validate(StatusDto dto) {
        if (dto.projectId() == null) throw new IllegalArgumentException("projectId is required");
        if (dto.orderNum() == null)  throw new IllegalArgumentException("orderNum is required");
        if (dto.name() == null || dto.name().isBlank())
            throw new IllegalArgumentException("name is required");
    }

    private void wire(StatusDto dto, Status e) {
        Project p = projects.findById(dto.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project %d not found".formatted(dto.projectId())));
        e.setProject(p);
    }

    @Transactional(readOnly = true)
    public List<StatusDto> getAllowedNext(long projectId, long taskId) {
        var entities = repo.findAllowedNextEntities(projectId, taskId);
        return entities.stream().map(mapper::toDto).toList();
    }

}