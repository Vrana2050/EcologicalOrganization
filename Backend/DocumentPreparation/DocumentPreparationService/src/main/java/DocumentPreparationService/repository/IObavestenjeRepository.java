package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Obavestenje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface IObavestenjeRepository extends ICrudRepository<Obavestenje, Long> {

    Set<Obavestenje> findAllByKorisnikId(Long korisnikId);
}
