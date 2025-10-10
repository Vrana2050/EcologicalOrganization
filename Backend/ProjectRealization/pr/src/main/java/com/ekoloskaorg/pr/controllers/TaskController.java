package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.TaskDto;
import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController extends AbstractCrudController<TaskDto, Long> {

    private final TaskService service;

    public TaskController(TaskService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/project/{id}")
    public ResponseEntity<List<TaskDto>> listByProjectId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findAllByProjectId(id));
    }
}