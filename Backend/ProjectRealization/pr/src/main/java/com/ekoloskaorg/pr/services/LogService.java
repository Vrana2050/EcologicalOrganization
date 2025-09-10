package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.dtos.LogDto;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.mappers.LogMapper;
import com.ekoloskaorg.pr.models.*;
import com.ekoloskaorg.pr.repositories.LogRepository;
import com.ekoloskaorg.pr.repositories.MemberRepository;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import com.ekoloskaorg.pr.repositories.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LogService extends AbstractCrudService<Log, Long, LogDto> {

    private static final Set<String> ALLOWED_ACTIONS = Set.of(
            "COMMENT",
            "TASK_STATUS_CHANGE",
            "TASK_CREATION",
            "PROJECT_CREATION",
            "ADD_MEMBER_TO_PROJECT",
            "ASSIGN_TASK",
            "ADD_RESOURCE_TO_TASK",
            "RESOURCE_PROVISION",
            "TEMPLATE_CREATION",
            "TEMPLATE_USAGE"
    );

    private final LogRepository repo;
    private final LogMapper mapper;
    private final ProjectRepository projects;
    private final MemberRepository members;
    private final TaskRepository tasks;

    @Override protected JpaRepository<Log, Long> repo() { return repo; }
    @Override protected BaseMapper<Log, LogDto> mapper() { return mapper; }

    @Override protected void beforeCreate(LogDto dto, Log e) { validate(dto); wire(dto, e); defaults(dto, e); }
    @Override protected void beforeUpdate(LogDto dto, Log e) { validate(dto); wire(dto, e); }

    private void validate(LogDto dto) {
        if (dto.projectId() == null) throw new IllegalArgumentException("projectId is required");
        if (dto.memberId()  == null) throw new IllegalArgumentException("memberId is required");
        if (dto.taskId()    == null) throw new IllegalArgumentException("taskId is required");
        if (dto.action() == null || !ALLOWED_ACTIONS.contains(dto.action()))
            throw new IllegalArgumentException("action must be one of " + ALLOWED_ACTIONS);
    }

    private void wire(LogDto dto, Log e) {
        Project p = projects.findById(dto.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project %d not found".formatted(dto.projectId())));
        Member m = members.findById(dto.memberId())
                .orElseThrow(() -> new EntityNotFoundException("Member %d not found".formatted(dto.memberId())));
        Task t = tasks.findById(dto.taskId())
                .orElseThrow(() -> new EntityNotFoundException("Task %d not found".formatted(dto.taskId())));

        if (m.getProject() == null || !m.getProject().getId().equals(p.getId()))
            throw new IllegalArgumentException("Member does not belong to the given project");
        if (t.getProject() == null || !t.getProject().getId().equals(p.getId()))
            throw new IllegalArgumentException("Task does not belong to the given project");

        e.setProject(p);
        e.setMember(m);
        e.setTask(t);
    }

    private void defaults(LogDto dto, Log e) {
        if (dto.timestamp() == null) e.setTimestamp(LocalDateTime.now());
    }
}