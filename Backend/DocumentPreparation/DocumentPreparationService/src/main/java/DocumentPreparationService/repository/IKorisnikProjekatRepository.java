package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IKorisnikProjekatRepository extends ICrudRepository<KorisnikProjekat, Long> {

}