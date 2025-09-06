package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.StatusLogDto;
import DocumentPreparationService.mapper.interfaces.IStatusLogConverter;
import DocumentPreparationService.model.StatusLog;
import DocumentPreparationService.service.interfaces.IStatusLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/statusLog")
@RequireRole(value = "administrator")
public class AdminStatusLogController extends BaseController<StatusLog,Long, StatusLogDto> {
    @Autowired
    private IStatusLogService statusLogService;
    @Autowired
    private IStatusLogConverter mapper;
    public AdminStatusLogController(IStatusLogService dokumentService, IStatusLogConverter  mapper) {
        super(dokumentService,mapper);
    }
}
