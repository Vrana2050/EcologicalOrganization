package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.RevizijaIzmenaDto;
import DocumentPreparationService.mapper.interfaces.IRevizijaIzmenaConverter;
import DocumentPreparationService.model.RevizijaIzmena;
import DocumentPreparationService.service.interfaces.IRevizijaIzmenaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/reviewChange")
public class ManagerRevizijaIzmenaController extends BaseController<RevizijaIzmena,Long, RevizijaIzmenaDto> {
    @Autowired
    private IRevizijaIzmenaService revizijaIzmenaService;
    @Autowired
    private IRevizijaIzmenaConverter mapper;
    public ManagerRevizijaIzmenaController(IRevizijaIzmenaService dokumentService, IRevizijaIzmenaConverter  mapper) {
        super(dokumentService,mapper);
    }
}
