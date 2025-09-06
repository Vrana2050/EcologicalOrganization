package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.service.interfaces.IDokumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/doc")
public class ManagerDocumentController extends BaseController<Dokument,Long,DokumentDto> {
    @Autowired
    private IDokumentService dokumentService;
    @Autowired
    private IDokumentConverter mapper;
    public ManagerDocumentController(IDokumentService dokumentService, IDokumentConverter  mapper) {
        super(dokumentService,mapper);
    }
}