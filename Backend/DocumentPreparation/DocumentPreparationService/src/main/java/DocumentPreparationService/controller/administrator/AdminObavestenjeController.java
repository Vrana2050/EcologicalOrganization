package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.ObavestenjeDto;
import DocumentPreparationService.mapper.interfaces.IObavestenjeConverter;
import DocumentPreparationService.model.Obavestenje;
import DocumentPreparationService.service.interfaces.IObavestenjeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/notification")
@RequireRole(value = "administrator")
public class AdminObavestenjeController extends BaseController<Obavestenje,Long, ObavestenjeDto> {
    @Autowired
    private IObavestenjeService obavestenjeService;
    @Autowired
    private IObavestenjeConverter mapper;
    public AdminObavestenjeController(IObavestenjeService dokumentService, IObavestenjeConverter  mapper) {
        super(dokumentService,mapper);
    }
}
