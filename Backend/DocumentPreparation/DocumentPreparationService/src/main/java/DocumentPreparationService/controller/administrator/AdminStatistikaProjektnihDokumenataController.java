package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.StatistikaProjektnihDokumenataDto;
import DocumentPreparationService.mapper.interfaces.IStatistikaProjektnihDokumenataConverter;
import DocumentPreparationService.model.StatistikaProjektnihDokumenata;
import DocumentPreparationService.service.interfaces.IStatistikaProjektnihDokumenataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/docStats")
@RequireRole(value = "administrator")
public class AdminStatistikaProjektnihDokumenataController extends BaseController<StatistikaProjektnihDokumenata,Long, StatistikaProjektnihDokumenataDto> {
    @Autowired
    private IStatistikaProjektnihDokumenataService statistikaProjektnihDokumenataService;
    @Autowired
    private IStatistikaProjektnihDokumenataConverter mapper;
    public AdminStatistikaProjektnihDokumenataController(IStatistikaProjektnihDokumenataService dokumentService, IStatistikaProjektnihDokumenataConverter  mapper) {
        super(dokumentService,mapper);
    }
}
