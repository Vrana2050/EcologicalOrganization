package com.ekoloskaorg.pr.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import com.ekoloskaorg.pr.dtos.StatusTransitionDto;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.mappers.StatusTransitionMapper;
import com.ekoloskaorg.pr.models.Project;
import com.ekoloskaorg.pr.models.Status;
import com.ekoloskaorg.pr.models.StatusTransition;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import com.ekoloskaorg.pr.repositories.StatusRepository;
import com.ekoloskaorg.pr.repositories.StatusTransitionRepository;


@Service
@RequiredArgsConstructor
public class StatusTransitionService extends AbstractCrudService<StatusTransition, Long, StatusTransitionDto> {

    private final StatusTransitionRepository repo;
    private final StatusTransitionMapper mapper;
    private final ProjectRepository projects;
    private final StatusRepository statuses;

    @Override protected JpaRepository<StatusTransition, Long> repo() { return repo; }
    @Override protected BaseMapper<StatusTransition, StatusTransitionDto> mapper() { return mapper; }

    @Override protected void beforeCreate(StatusTransitionDto dto, StatusTransition e) { validate(dto, true);  wire(dto, e); }
    @Override protected void beforeUpdate(StatusTransitionDto dto, StatusTransition e) { validate(dto, false); wire(dto, e); }

    private void validate(StatusTransitionDto dto, boolean creating) {
        if (dto.projectId() == null)   throw new IllegalArgumentException("projectId is required");
        if (dto.fromStatusId() == null) throw new IllegalArgumentException("fromStatusId is required");
        if (dto.toStatusId() == null)   throw new IllegalArgumentException("toStatusId is required");
        if (dto.fromStatusId().equals(dto.toStatusId()))
            throw new IllegalArgumentException("fromStatusId and toStatusId must be different");
        if (creating && repo.existsByProject_IdAndFromStatus_IdAndToStatus_Id(dto.projectId(), dto.fromStatusId(), dto.toStatusId()))
            throw new IllegalArgumentException("Transition already exists for this project");
    }

    private void wire(StatusTransitionDto dto, StatusTransition e) {
        Project p = projects.findById(dto.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project %d not found".formatted(dto.projectId())));
        e.setProject(p);

        Status from = statuses.findById(dto.fromStatusId())
                .orElseThrow(() -> new EntityNotFoundException("Status %d not found".formatted(dto.fromStatusId())));
        Status to = statuses.findById(dto.toStatusId())
                .orElseThrow(() -> new EntityNotFoundException("Status %d not found".formatted(dto.toStatusId())));

        if (!from.getProject().getId().equals(p.getId()) || !to.getProject().getId().equals(p.getId()))
            throw new IllegalArgumentException("Both statuses must belong to the given project");

        e.setFromStatus(from);
        e.setToStatus(to);
    }
}