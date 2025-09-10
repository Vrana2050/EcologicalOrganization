package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.UnitsOfMeasureDto;
import com.ekoloskaorg.pr.services.UnitsOfMeasureService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/units")
public class UnitsOfMeasureController extends AbstractCrudController<UnitsOfMeasureDto, Long> {

    public UnitsOfMeasureController(UnitsOfMeasureService service) {
        super(service);
    }
}