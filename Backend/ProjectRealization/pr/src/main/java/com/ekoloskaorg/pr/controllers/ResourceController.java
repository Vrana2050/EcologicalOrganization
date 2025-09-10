package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.ResourceDto;
import com.ekoloskaorg.pr.services.ResourceService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
public class ResourceController extends AbstractCrudController<ResourceDto, Long> {

    public ResourceController(ResourceService service) {
        super(service);
    }
}
