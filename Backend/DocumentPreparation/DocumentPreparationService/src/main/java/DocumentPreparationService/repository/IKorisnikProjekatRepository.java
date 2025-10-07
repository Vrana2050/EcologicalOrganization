package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Projekat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface IKorisnikProjekatRepository extends ICrudRepository<KorisnikProjekat, Long> {

    public Set<KorisnikProjekat> findAllByIdIn(Set<Long> ids);

    Optional<KorisnikProjekat> findByProjekatIdAndKorisnikId(Long projekatId, Long korisnikId);

    Set<KorisnikProjekat> findAllByKorisnikId(Long korisnikId);


    @Query("SELECT kp FROM KorisnikProjekat kp " +
            "LEFT JOIN FETCH kp.dokumenti d " +
            "WHERE kp.korisnikId = :userId AND kp.projekat.id = :projekatId")
    Optional<KorisnikProjekat> findByUserAndProjekatWithDocuments(
            @Param("userId") Long userId,
            @Param("projekatId") Long projekatId
    );

    Set<KorisnikProjekat> getAllByProjekatId(Long projekatId);
}