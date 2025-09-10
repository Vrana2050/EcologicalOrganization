package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.service.interfaces.IDokumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/doc")
@RequireRole(value = "administrator")
public class AdminDocumentController extends BaseController<Dokument,Long,DokumentDto> {
    @Autowired
    private IDokumentService dokumentService;
    @Autowired
    private IDokumentConverter mapper;
    public AdminDocumentController(IDokumentService dokumentService, IDokumentConverter  mapper) {
        super(dokumentService,mapper);
    }
}