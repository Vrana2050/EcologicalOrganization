package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.StatusLogDto;
import DocumentPreparationService.mapper.interfaces.IStatusLogConverter;
import DocumentPreparationService.model.StatusLog;
import DocumentPreparationService.service.interfaces.IStatusLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/statusLog")
public class ManagerStatusLogController extends BaseController<StatusLog,Long, StatusLogDto> {
    @Autowired
    private IStatusLogService statusLogService;
    @Autowired
    private IStatusLogConverter mapper;
    public ManagerStatusLogController(IStatusLogService dokumentService, IStatusLogConverter  mapper) {
        super(dokumentService,mapper);
    }
}
