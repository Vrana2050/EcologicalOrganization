package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

public interface IKorisnikProjekatService extends ICrudService<KorisnikProjekat,Long> {
    Set<KorisnikProjekat> findByIds(Set<Long> ids);

    Optional<KorisnikProjekat> findByUserAndProjekat(Long userId, Long projekatId);

    Set<KorisnikProjekat> findByUser(Long userId);

    boolean isKorisnikDodeljenik(Long userId,Long projekatId, Long dokumentId);

    Set<KorisnikProjekat> getAllAvailableOnProject(Long projekatId, Long userId);
}
