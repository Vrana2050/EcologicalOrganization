package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.TemplateDto;
import com.ekoloskaorg.pr.mappers.TemplateMapper;
import com.ekoloskaorg.pr.models.Project;
import com.ekoloskaorg.pr.models.Template;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import com.ekoloskaorg.pr.repositories.TemplateRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TemplateService extends AbstractCrudService<Template, Long, TemplateDto> {

    private final TemplateRepository repo;
    private final TemplateMapper mapper;
    private final ProjectRepository projects;

    @Override protected JpaRepository<Template, Long> repo() { return repo; }
    @Override protected BaseMapper<Template, TemplateDto> mapper() { return mapper; }

    @Override protected void beforeCreate(TemplateDto dto, Template e) { validateCreate(dto); wire(dto, e); }
    @Override protected void beforeUpdate(TemplateDto dto, Template e) { validateUpdate(dto); wire(dto, e); }

    private void validateCreate(TemplateDto dto) {
        if (dto.projectId() == null) throw new IllegalArgumentException("projectId is required");
        if (repo.existsByProject_Id(dto.projectId()))
            throw new IllegalArgumentException("This project already has a template");
    }

    private void validateUpdate(TemplateDto dto) {
        if (dto.projectId() == null) throw new IllegalArgumentException("projectId is required");
    }

    private void wire(TemplateDto dto, Template e) {
        Project p = projects.findById(dto.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project %d not found".formatted(dto.projectId())));
        e.setProject(p);
    }


    @Override @Transactional
    public TemplateDto create(TemplateDto dto) {
        Template entity = mapper.toEntity(dto);
        beforeCreate(dto, entity);
        Template saved = repo.save(entity);

        Project p = saved.getProject();
        if (p.getTemplate() == null) {
            p.setTemplate(saved);
            projects.save(p);
        }
        return mapper.toDto(saved);
    }
}