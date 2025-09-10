package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.ProjectDto;
import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController extends AbstractCrudController<ProjectDto, Long> {

    public ProjectController(ProjectService service) {
        super(service);
    }
}