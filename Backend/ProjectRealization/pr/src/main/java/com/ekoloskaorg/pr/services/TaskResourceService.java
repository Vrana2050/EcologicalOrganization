package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.TaskResourceDto;
import com.ekoloskaorg.pr.mappers.TaskResourceMapper;
import com.ekoloskaorg.pr.models.Resource;
import com.ekoloskaorg.pr.models.Task;
import com.ekoloskaorg.pr.models.TaskResource;
import com.ekoloskaorg.pr.repositories.ResourceRepository;
import com.ekoloskaorg.pr.repositories.TaskRepository;
import com.ekoloskaorg.pr.repositories.TaskResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class TaskResourceService extends AbstractCrudService<TaskResource, Long, TaskResourceDto> {

    private final TaskResourceRepository repo;
    private final TaskResourceMapper mapper;
    private final TaskRepository tasks;
    private final ResourceRepository resources;

    @Override protected JpaRepository<TaskResource, Long> repo() { return repo; }
    @Override protected BaseMapper<TaskResource, TaskResourceDto> mapper() { return mapper; }

    @Override protected void beforeCreate(TaskResourceDto dto, TaskResource e) { validate(dto, true);  wire(dto, e); }
    @Override protected void beforeUpdate(TaskResourceDto dto, TaskResource e) { validate(dto, false); wire(dto, e); }

    private void validate(TaskResourceDto dto, boolean creating) {
        if (dto.taskId() == null)     throw new IllegalArgumentException("taskId is required");
        if (dto.resourceId() == null) throw new IllegalArgumentException("resourceId is required");
        if (dto.quantity() == null || dto.quantity().compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("quantity must be > 0");
        if (creating && repo.existsByTask_IdAndResource_Id(dto.taskId(), dto.resourceId()))
            throw new IllegalArgumentException("This resource is already attached to the task");
    }

    private void wire(TaskResourceDto dto, TaskResource e) {
        Task t = tasks.findById(dto.taskId())
                .orElseThrow(() -> new EntityNotFoundException("Task %d not found".formatted(dto.taskId())));
        Resource r = resources.findById(dto.resourceId())
                .orElseThrow(() -> new EntityNotFoundException("Resource %d not found".formatted(dto.resourceId())));
        e.setTask(t);
        e.setResource(r);

        if (dto.provided() == null) e.setProvided(Boolean.FALSE);
    }
}