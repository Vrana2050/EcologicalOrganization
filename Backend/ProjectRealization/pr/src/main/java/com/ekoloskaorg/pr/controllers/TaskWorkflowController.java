package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.StatusDto;
import com.ekoloskaorg.pr.services.StatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
/*
@RestController
@RequestMapping("/api/projects/{projectId}/tasks/{taskId}")
@RequiredArgsConstructor
public class TaskWorkflowController {
    private final StatusService statusService;

    @GetMapping("/allowed-statuses")
    public List<StatusDto> allowed(@PathVariable long projectId, @PathVariable long taskId) {
        return statusService.getAllowedNext(projectId, taskId);
    }

    @PostMapping("/status")
    public void changeStatus(@PathVariable long projectId,
                             @PathVariable long taskId,
                             @RequestBody ChangeStatusRequest body) {
        taskService.changeStatus(projectId, taskId, body.toStatusId(), body.changedByMemberId());
    }
}
*/