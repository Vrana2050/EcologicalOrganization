package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.StatistikaProjektnihDokumenataDto;
import DocumentPreparationService.mapper.interfaces.IStatistikaProjektnihDokumenataConverter;
import DocumentPreparationService.model.StatistikaProjektnihDokumenata;
import DocumentPreparationService.service.interfaces.IStatistikaProjektnihDokumenataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/docStats")
public class ManagerStatistikaProjektnihDokumenataController extends BaseController<StatistikaProjektnihDokumenata,Long, StatistikaProjektnihDokumenataDto> {
    @Autowired
    private IStatistikaProjektnihDokumenataService statistikaProjektnihDokumenataService;
    @Autowired
    private IStatistikaProjektnihDokumenataConverter mapper;
    public ManagerStatistikaProjektnihDokumenataController(IStatistikaProjektnihDokumenataService dokumentService, IStatistikaProjektnihDokumenataConverter  mapper) {
        super(dokumentService,mapper);
    }
}
