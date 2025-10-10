package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.StatusTransitionDto;
import com.ekoloskaorg.pr.services.StatusTransitionService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/status-transitions")
public class StatusTransitionController extends AbstractCrudController<StatusTransitionDto, Long> {

    public StatusTransitionController(StatusTransitionService service) {
        super(service);
    }
}
