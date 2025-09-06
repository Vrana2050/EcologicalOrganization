package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.TokStatusDto;
import DocumentPreparationService.mapper.interfaces.ITokStatusConverter;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.service.interfaces.ITokStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/workflowStatus")
public class ManagerTokStatusController extends BaseController<TokStatus,Long, TokStatusDto> {
    @Autowired
    private ITokStatusService tokService;
    @Autowired
    private ITokStatusConverter mapper;
    public ManagerTokStatusController(ITokStatusService dokumentService, ITokStatusConverter  mapper) {
        super(dokumentService,mapper);
    }
}
