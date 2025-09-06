package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.StatusDto;
import DocumentPreparationService.mapper.interfaces.IStatusConverter;
import DocumentPreparationService.model.Status;
import DocumentPreparationService.service.interfaces.IStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/status")
@RequireRole(value = "administrator")
public class AdminStatusController extends BaseController<Status,Long, StatusDto> {
    @Autowired
    private IStatusService statusService;
    @Autowired
    private IStatusConverter mapper;
    public AdminStatusController(IStatusService dokumentService, IStatusConverter  mapper) {
        super(dokumentService,mapper);
    }
}
