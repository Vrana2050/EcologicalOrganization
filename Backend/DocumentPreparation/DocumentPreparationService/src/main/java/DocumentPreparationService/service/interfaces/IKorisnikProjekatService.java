package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;

import java.util.Set;
import java.util.stream.Stream;

public interface IKorisnikProjekatService extends ICrudService<KorisnikProjekat,Long>{
    Set<KorisnikProjekat> findByIds(Set<Long> ids);
}
