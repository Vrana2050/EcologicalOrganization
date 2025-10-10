package com.ekoloskaorg.pr.services;


import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.ProjectDto;
import com.ekoloskaorg.pr.mappers.ProjectMapper;
import com.ekoloskaorg.pr.models.Project;
import com.ekoloskaorg.pr.models.Template;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import com.ekoloskaorg.pr.repositories.TemplateRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService extends AbstractCrudService<Project, Long, ProjectDto> {

    private final ProjectRepository repo;
    private final ProjectMapper mapper;
    private final TemplateRepository templates;

    @Override protected JpaRepository<Project, Long> repo() { return repo; }
    @Override protected BaseMapper<Project, ProjectDto> mapper() { return mapper; }

    @Override protected void beforeCreate(ProjectDto dto, Project e) { validate(dto); wireTemplate(dto, e); }
    @Override protected void beforeUpdate(ProjectDto dto, Project e) { validate(dto); wireTemplate(dto, e); }


    @Transactional(readOnly = true)
    public Page<ProjectDto> listActive(Pageable pageable) {
        return repo.findAllByArchivedFalse(pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ProjectDto> listArchived(Pageable pageable) {
        return repo.findAllByArchivedTrue(pageable).map(mapper::toDto);
    }


    private void validate(ProjectDto dto) {
        if (dto.name() == null || dto.name().isBlank())
            throw new IllegalArgumentException("Project.name is required");
        if (dto.startDate() != null && dto.endDate() != null && dto.endDate().isBefore(dto.startDate()))
            throw new IllegalArgumentException("endDate must be after startDate");
    }

    private void wireTemplate(ProjectDto dto, Project e) {
        if (dto.templateId() == null) { e.setTemplate(null); return; }
        Template t = templates.findById(dto.templateId())
                .orElseThrow(() -> new EntityNotFoundException("Template %d not found".formatted(dto.templateId())));
        e.setTemplate(t);
    }


}