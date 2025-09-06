package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.StatistikaProjektaDto;
import DocumentPreparationService.mapper.interfaces.IStatistikaProjektaConverter;
import DocumentPreparationService.model.StatistikaProjekta;
import DocumentPreparationService.service.interfaces.IStatistikaProjektaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/projectStats")
public class ManagerStatistikaProjektaController extends BaseController<StatistikaProjekta,Long, StatistikaProjektaDto> {
    @Autowired
    private IStatistikaProjektaService statistikaProjektaService;
    @Autowired
    private IStatistikaProjektaConverter mapper;
    public ManagerStatistikaProjektaController(IStatistikaProjektaService dokumentService, IStatistikaProjektaConverter  mapper) {
        super(dokumentService,mapper);
    }
}
