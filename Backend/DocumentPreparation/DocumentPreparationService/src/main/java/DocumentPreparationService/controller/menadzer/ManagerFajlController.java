package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.mapper.interfaces.IFajlConverter;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.service.interfaces.IFajlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/file")
public class ManagerFajlController extends BaseController<Fajl,Long, FajlDto> {
    @Autowired
    private IFajlService fajlService;
    @Autowired
    private IFajlConverter mapper;
    public ManagerFajlController(IFajlService dokumentService, IFajlConverter  mapper) {
        super(dokumentService,mapper);
    }
}
