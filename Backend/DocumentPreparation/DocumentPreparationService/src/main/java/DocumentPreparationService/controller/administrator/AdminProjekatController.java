package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.ProjekatDto;
import DocumentPreparationService.mapper.interfaces.IProjekatConverter;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.service.interfaces.IProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/project")
@RequireRole(value = "administrator")
public class AdminProjekatController extends BaseController<Projekat,Long, ProjekatDto> {
    @Autowired
    private IProjekatService projekatService;
    @Autowired
    private IProjekatConverter mapper;
    public AdminProjekatController(IProjekatService projekatService, IProjekatConverter  mapper) {
        super(projekatService,mapper);
    }
}
