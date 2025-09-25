package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.dtos.TaskStatusHistoryDto;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.mappers.TaskStatusHistoryMapper;
import com.ekoloskaorg.pr.models.Status;
import com.ekoloskaorg.pr.models.Task;
import com.ekoloskaorg.pr.models.TaskStatusHistory;
import com.ekoloskaorg.pr.repositories.StatusRepository;
import com.ekoloskaorg.pr.repositories.TaskRepository;
import com.ekoloskaorg.pr.repositories.TaskStatusHistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class TaskStatusHistoryService extends AbstractCrudService<TaskStatusHistory, Long, TaskStatusHistoryDto> {

    private final TaskStatusHistoryRepository repo;
    private final TaskStatusHistoryMapper mapper;
    private final TaskRepository tasks;
    private final StatusRepository statuses;

    @Override protected JpaRepository<TaskStatusHistory, Long> repo() { return repo; }
    @Override protected BaseMapper<TaskStatusHistory, TaskStatusHistoryDto> mapper() { return mapper; }

    @Override protected void beforeCreate(TaskStatusHistoryDto dto, TaskStatusHistory e) { validate(dto); wire(dto, e); }
    @Override protected void beforeUpdate(TaskStatusHistoryDto dto, TaskStatusHistory e) { validate(dto); wire(dto, e); }

    private void validate(TaskStatusHistoryDto dto) {
        if (dto.taskId() == null)   throw new IllegalArgumentException("taskId is required");
        if (dto.statusId() == null) throw new IllegalArgumentException("statusId is required");
    }

    private void wire(TaskStatusHistoryDto dto, TaskStatusHistory e) {
        Task t = tasks.findById(dto.taskId())
                .orElseThrow(() -> new EntityNotFoundException("Task %d not found".formatted(dto.taskId())));
        Status s = statuses.findById(dto.statusId())
                .orElseThrow(() -> new EntityNotFoundException("Status %d not found".formatted(dto.statusId())));

        if (!s.getProject().getId().equals(t.getProject().getId()))
            throw new IllegalArgumentException("Status and Task must belong to the same project");

        e.setTask(t);
        e.setStatus(s);

        if (dto.changedAt() == null) e.setChangedAt(LocalDateTime.now());
    }
}