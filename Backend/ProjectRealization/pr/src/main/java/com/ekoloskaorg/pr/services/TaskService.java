// src/main/java/com/ekoloskaorg/pr/services/TaskService.java
package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.TaskDto;
import com.ekoloskaorg.pr.mappers.TaskMapper;
import com.ekoloskaorg.pr.models.Member;
import com.ekoloskaorg.pr.models.Project;
import com.ekoloskaorg.pr.models.Status;
import com.ekoloskaorg.pr.models.Task;
import com.ekoloskaorg.pr.repositories.MemberRepository;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import com.ekoloskaorg.pr.repositories.StatusRepository;
import com.ekoloskaorg.pr.repositories.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService extends AbstractCrudService<Task, Long, TaskDto> {

    private final TaskRepository repo;
    private final TaskMapper mapper;
    private final ProjectRepository projects;
    private final StatusRepository statuses;
    private final MemberRepository members;

    @Override protected JpaRepository<Task, Long> repo() { return repo; }
    @Override protected BaseMapper<Task, TaskDto> mapper() { return mapper; }

    @Override protected void beforeCreate(TaskDto dto, Task e) { validate(dto); wire(dto, e); }
    @Override protected void beforeUpdate(TaskDto dto, Task e) { validate(dto); wire(dto, e); }

    private void validate(TaskDto dto) {
        if (dto.projectId() == null) throw new IllegalArgumentException("projectId is required");
        if (dto.statusId()  == null) throw new IllegalArgumentException("statusId is required");
        if (dto.name() == null || dto.name().isBlank())
            throw new IllegalArgumentException("name is required");
        if (dto.finishedAt() != null && dto.createdAt() != null &&
                dto.finishedAt().isBefore(dto.createdAt()))
            throw new IllegalArgumentException("finishedAt must be after createdAt");
        if (dto.deadline() != null && dto.createdAt() != null &&
                dto.deadline().isBefore(dto.createdAt()))
            throw new IllegalArgumentException("deadline must be after createdAt");
    }

    private void wire(TaskDto dto, Task e) {
        Project p = projects.findById(dto.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project %d not found".formatted(dto.projectId())));
        e.setProject(p);

        Status s = statuses.findById(dto.statusId())
                .orElseThrow(() -> new EntityNotFoundException("Status %d not found".formatted(dto.statusId())));
        if (s.getProject() == null || !s.getProject().getId().equals(p.getId()))
            throw new IllegalArgumentException("Status does not belong to the same project");

        e.setStatus(s);

        if (dto.assignedMemberId() != null) {
            Member m = members.findById(dto.assignedMemberId())
                    .orElseThrow(() -> new EntityNotFoundException("Member %d not found".formatted(dto.assignedMemberId())));
            if (m.getProject() == null || !m.getProject().getId().equals(p.getId()))
                throw new IllegalArgumentException("Assigned member does not belong to the same project");
            e.setAssignedMember(m);
        } else {
            e.setAssignedMember(null);
        }
    }
}
