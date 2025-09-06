package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.TokDto;
import DocumentPreparationService.mapper.interfaces.ITokConverter;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.service.interfaces.ITokService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/workflow")
public class ManagerTokController extends BaseController<Tok,Long, TokDto> {
    @Autowired
    private ITokService tokService;
    @Autowired
    private ITokConverter mapper;
    public ManagerTokController(ITokService dokumentService, ITokConverter  mapper) {
        super(dokumentService,mapper);
    }
}
