package com.ekoloskaorg.pr.controllers;


import com.ekoloskaorg.pr.dtos.CommentDto;
import com.ekoloskaorg.pr.services.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController extends AbstractCrudController<CommentDto,Long> {

    private final CommentService service;
    public CommentController(CommentService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<CommentDto>> getCommentsForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getCommentsForTask(taskId));
    }

    @PostMapping("/count")
    public Map<Long, Long> countByTaskIdsPost(@RequestBody List<Long> taskIds) {
        return service.getCountsForTaskIds(taskIds);
    }
}
