package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.StatusTransitionDto;
import com.ekoloskaorg.pr.services.StatusTransitionService;

public class StatusTransitionController extends AbstractCrudController<StatusTransitionDto, Long> {

    public StatusTransitionController(StatusTransitionService service) {
        super(service);
    }
}
