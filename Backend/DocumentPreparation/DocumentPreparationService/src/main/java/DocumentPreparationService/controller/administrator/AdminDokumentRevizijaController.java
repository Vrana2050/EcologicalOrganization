package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.DokumentRevizijaDto;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.service.interfaces.IDokumentRevizijaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/docPrep/admin/docReview")
@RequireRole(value = "administrator")
public class AdminDokumentRevizijaController extends BaseController<DokumentRevizija,Long, DokumentRevizijaDto> {
    @Autowired
    private IDokumentRevizijaService dokumentRevizijaService;
    @Autowired
    private IDokumentRevizijaConverter mapper;
    public AdminDokumentRevizijaController(IDokumentRevizijaService dokumentService, IDokumentRevizijaConverter  mapper) {
        super(dokumentService,mapper);
    }
}
