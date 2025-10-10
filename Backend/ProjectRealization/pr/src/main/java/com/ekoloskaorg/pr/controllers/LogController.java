package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.LogDto;
import com.ekoloskaorg.pr.services.LogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
public class LogController extends AbstractCrudController<LogDto,Long> {

    private final LogService service;
    public LogController(LogService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/project/{id}")
    public ResponseEntity<Page<LogDto>> listByProjectId(Pageable pageable, @PathVariable Long id) {
        return ResponseEntity.ok(service.findAllByProjectId(pageable,id));
    }
}
