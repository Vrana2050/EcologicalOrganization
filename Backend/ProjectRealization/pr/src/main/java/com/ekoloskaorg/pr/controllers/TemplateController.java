package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.TemplateDto;
import com.ekoloskaorg.pr.services.TemplateService;

public class TemplateController extends AbstractCrudController<TemplateDto,Long> {

    public TemplateController(TemplateService service) {
        super(service);
    }
}
