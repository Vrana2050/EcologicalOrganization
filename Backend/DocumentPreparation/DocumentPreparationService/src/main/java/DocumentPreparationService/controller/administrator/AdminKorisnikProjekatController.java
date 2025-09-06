package DocumentPreparationService.controller.administrator;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docPrep/admin/userProject")
@RequireRole(value = "administrator")
public class AdminKorisnikProjekatController extends BaseController<KorisnikProjekat,Long, KorisnikProjekatDto> {
    @Autowired
    private IKorisnikProjekatService korisnikProjekatService;
    @Autowired
    private IKorisnikProjekatConverter mapper;
    public AdminKorisnikProjekatController(IKorisnikProjekatService dokumentService, IKorisnikProjekatConverter  mapper) {
        super(dokumentService,mapper);
    }
}
