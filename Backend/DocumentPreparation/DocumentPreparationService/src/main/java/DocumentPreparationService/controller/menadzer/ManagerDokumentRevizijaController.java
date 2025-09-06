package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.DokumentRevizijaDto;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.service.interfaces.IDokumentRevizijaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/docPrep/manager/docReview")
public class ManagerDokumentRevizijaController extends BaseController<DokumentRevizija,Long, DokumentRevizijaDto> {
    @Autowired
    private IDokumentRevizijaService dokumentRevizijaService;
    @Autowired
    private IDokumentRevizijaConverter mapper;
    public ManagerDokumentRevizijaController(IDokumentRevizijaService dokumentService, IDokumentRevizijaConverter  mapper) {
        super(dokumentService,mapper);
    }
}
