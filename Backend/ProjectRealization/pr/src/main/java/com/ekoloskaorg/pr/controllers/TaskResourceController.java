package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.TaskResourceDto;
import com.ekoloskaorg.pr.services.TaskResourceService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/task-resources")
public class TaskResourceController extends AbstractCrudController<TaskResourceDto, Long> {

    public TaskResourceController(TaskResourceService service) {
        super(service);
    }
}