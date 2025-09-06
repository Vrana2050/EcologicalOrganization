package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.TokDto;
import DocumentPreparationService.mapper.interfaces.ITokConverter;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.service.interfaces.ITokService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/workflow")
@RequireRole(value = "administrator")
public class AdminTokController extends BaseController<Tok,Long, TokDto> {
    @Autowired
    private ITokService tokService;
    @Autowired
    private ITokConverter mapper;
    public AdminTokController(ITokService dokumentService, ITokConverter  mapper) {
        super(dokumentService,mapper);
    }
}
