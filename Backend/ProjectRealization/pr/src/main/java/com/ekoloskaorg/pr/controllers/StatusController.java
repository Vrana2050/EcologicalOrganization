package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.StatusDto;
import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.services.StatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statuses")
public class StatusController extends AbstractCrudController<StatusDto, Long> {

    public StatusController(StatusService service) {
        super(service);
    }
}