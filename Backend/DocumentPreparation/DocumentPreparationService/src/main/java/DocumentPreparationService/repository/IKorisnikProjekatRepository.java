package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface IKorisnikProjekatRepository extends ICrudRepository<KorisnikProjekat, Long> {

    public Set<KorisnikProjekat> findAllByIdIn(Set<Long> ids);
}