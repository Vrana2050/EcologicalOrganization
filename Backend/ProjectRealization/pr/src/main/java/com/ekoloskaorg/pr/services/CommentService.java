package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.CommentDto;
import com.ekoloskaorg.pr.mappers.CommentMapper;
import com.ekoloskaorg.pr.models.Comment;
import com.ekoloskaorg.pr.models.Member;
import com.ekoloskaorg.pr.models.Project;
import com.ekoloskaorg.pr.models.Task;
import com.ekoloskaorg.pr.repositories.CommentRepository;
import com.ekoloskaorg.pr.repositories.MemberRepository;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import com.ekoloskaorg.pr.repositories.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentService extends AbstractCrudService<Comment, Long, CommentDto> {

    private final CommentRepository repo;
    private final CommentMapper mapper;
    private final ProjectRepository projects;
    private final TaskRepository tasks;
    private final MemberRepository members;

    @Override protected JpaRepository<Comment, Long> repo() { return repo; }
    @Override protected BaseMapper<Comment, CommentDto> mapper() { return mapper; }

    @Override protected void beforeCreate(CommentDto dto, Comment e) { validate(dto); wire(dto, e); }
    @Override protected void beforeUpdate(CommentDto dto, Comment e) { validate(dto); wire(dto, e); }

    private void validate(CommentDto dto) {
        if (dto.projectId() == null) throw new IllegalArgumentException("projectId is required");
        if (dto.taskId()    == null) throw new IllegalArgumentException("taskId is required");
        if (dto.memberId()  == null) throw new IllegalArgumentException("memberId is required");
        if (dto.text() == null || dto.text().isBlank())
            throw new IllegalArgumentException("text is required");
    }

    private void wire(CommentDto dto, Comment e) {
        Project p = projects.findById(dto.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project %d not found".formatted(dto.projectId())));
        e.setProject(p);

        Task t = tasks.findById(dto.taskId())
                .orElseThrow(() -> new EntityNotFoundException("Task %d not found".formatted(dto.taskId())));
        if (!t.getProject().getId().equals(p.getId()))
            throw new IllegalArgumentException("Task does not belong to the same project");
        e.setTask(t);

        Member m = members.findById(dto.memberId())
                .orElseThrow(() -> new EntityNotFoundException("Member %d not found".formatted(dto.memberId())));
        if (!m.getProject().getId().equals(p.getId()))
            throw new IllegalArgumentException("Member does not belong to the same project");
        e.setMember(m);

        if (dto.createdAt() == null) {
            e.setCreatedAt(LocalDateTime.now());
        }
    }
}