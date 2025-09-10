package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.TaskDto;
import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController extends AbstractCrudController<TaskDto, Long> {

    public TaskController(TaskService service) {
        super(service);
    }
}