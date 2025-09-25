package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.TaskStatusHistoryDto;
import com.ekoloskaorg.pr.services.TaskStatusHistoryService;

public class TaskStatusHistoryController extends AbstractCrudController<TaskStatusHistoryDto,Long> {

    public TaskStatusHistoryController(TaskStatusHistoryService service) {
        super(service);
    }
}
