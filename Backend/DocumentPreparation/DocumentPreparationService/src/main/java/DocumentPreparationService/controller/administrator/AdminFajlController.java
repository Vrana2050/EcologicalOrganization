package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.mapper.interfaces.IFajlConverter;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.service.interfaces.IFajlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/file")
@RequireRole(value = "administrator")
public class AdminFajlController extends BaseController<Fajl,Long, FajlDto> {
    @Autowired
    private IFajlService fajlService;
    @Autowired
    private IFajlConverter mapper;
    public AdminFajlController(IFajlService dokumentService, IFajlConverter  mapper) {
        super(dokumentService,mapper);
    }
}
