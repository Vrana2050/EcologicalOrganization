package DocumentPreparationService.controller.KorisnikProjekat;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.DokumentAktivniFajlDto;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.mapper.interfaces.IDokumentAktivniFajlConverter;
import DocumentPreparationService.mapper.interfaces.IFajlConverter;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.model.DokumentAktivniFajl;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.service.interfaces.IFajlService;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/userProject")
@RequireRole(value = "managerOrEmployee")

public class UserProjekatController {
    @Autowired
    private IKorisnikProjekatService korisnikProjekatService;
    @Autowired
    private IKorisnikProjekatConverter mapper;

    @GetMapping("/available/{projekatId}")
    public ResponseEntity<Set<KorisnikProjekatDto>> getAllAvailableOnProject(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long projekatId) {
        Set<KorisnikProjekat> entities = korisnikProjekatService.getAllAvailableOnProject(projekatId,userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }


}