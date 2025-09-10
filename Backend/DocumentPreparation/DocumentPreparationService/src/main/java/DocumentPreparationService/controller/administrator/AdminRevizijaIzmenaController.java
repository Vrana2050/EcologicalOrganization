package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.RevizijaIzmenaDto;
import DocumentPreparationService.mapper.interfaces.IRevizijaIzmenaConverter;
import DocumentPreparationService.model.RevizijaIzmena;
import DocumentPreparationService.service.interfaces.IRevizijaIzmenaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/reviewChange")
@RequireRole(value = "administrator")
public class AdminRevizijaIzmenaController extends BaseController<RevizijaIzmena,Long, RevizijaIzmenaDto> {
    @Autowired
    private IRevizijaIzmenaService revizijaIzmenaService;
    @Autowired
    private IRevizijaIzmenaConverter mapper;
    public AdminRevizijaIzmenaController(IRevizijaIzmenaService dokumentService, IRevizijaIzmenaConverter  mapper) {
        super(dokumentService,mapper);
    }
}
