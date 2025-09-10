package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.LogDto;
import com.ekoloskaorg.pr.services.LogService;

public class LogController extends AbstractCrudController<LogDto,Long> {
    public LogController(LogService service) {
        super(service);
    }
}
