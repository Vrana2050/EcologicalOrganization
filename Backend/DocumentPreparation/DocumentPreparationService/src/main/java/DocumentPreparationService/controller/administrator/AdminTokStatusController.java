package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.TokStatusDto;
import DocumentPreparationService.mapper.interfaces.ITokStatusConverter;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.service.interfaces.ITokStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/workflowStatus")
@RequireRole(value = "administrator")
public class AdminTokStatusController extends BaseController<TokStatus,Long, TokStatusDto> {
    @Autowired
    private ITokStatusService tokService;
    @Autowired
    private ITokStatusConverter mapper;
    public AdminTokStatusController(ITokStatusService dokumentService, ITokStatusConverter  mapper) {
        super(dokumentService,mapper);
    }
}
