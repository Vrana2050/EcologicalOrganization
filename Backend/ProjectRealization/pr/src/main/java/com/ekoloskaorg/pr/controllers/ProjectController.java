package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.ProjectDto;
import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController extends AbstractCrudController<ProjectDto, Long> {

    private final ProjectService service;
    public ProjectController(ProjectService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/active")
    public ResponseEntity<Page<ProjectDto>> listActive(Pageable pageable) {
        return ResponseEntity.ok(service.listActive(pageable));
    }

    @GetMapping("/archived")
    public ResponseEntity<Page<ProjectDto>> listArchived(Pageable pageable) {
        return ResponseEntity.ok(service.listArchived(pageable));
    }
}