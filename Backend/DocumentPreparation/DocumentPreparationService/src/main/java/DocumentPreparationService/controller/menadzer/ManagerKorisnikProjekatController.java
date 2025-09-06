package DocumentPreparationService.controller.menadzer;

import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/manager/userProject")
public class ManagerKorisnikProjekatController extends BaseController<KorisnikProjekat,Long, KorisnikProjekatDto> {
    @Autowired
    private IKorisnikProjekatService korisnikProjekatService;
    @Autowired
    private IKorisnikProjekatConverter mapper;
    public ManagerKorisnikProjekatController(IKorisnikProjekatService dokumentService, IKorisnikProjekatConverter  mapper) {
        super(dokumentService,mapper);
    }
}
