package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.StatusDto;
import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.services.StatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statuses")
public class StatusController extends AbstractCrudController<StatusDto, Long> {

    private final StatusService service;

    public StatusController(StatusService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/project/{id}")
    public ResponseEntity<List<StatusDto>> listByProjectId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findAllByProjectId(id));
    }

    @GetMapping("/project/{id}/task/{taskId}/allowed-next")
    public ResponseEntity<List<StatusDto>> getAllowedNext(@PathVariable Long id, @PathVariable Long taskId) {
        return ResponseEntity.ok(service.getAllowedNext(id, taskId));  }
}