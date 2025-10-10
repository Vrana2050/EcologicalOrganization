package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.TaskResourceDto;
import com.ekoloskaorg.pr.dtos.TaskResourceView;
import com.ekoloskaorg.pr.services.TaskResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-resources")
public class TaskResourceController extends AbstractCrudController<TaskResourceDto, Long> {

    private final TaskResourceService service;
    public TaskResourceController(TaskResourceService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskResourceView>> getTaskResources(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getResourcesForTask(taskId));
    }

    record ProvidedDto(Boolean provided) {}


}