package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Projekat;
import com.netflix.eureka.registry.Key;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface IProjekatRepository extends ICrudRepository<Projekat, Long> {

    @Query("SELECT p FROM Projekat p LEFT JOIN FETCH p.korisniciProjekta WHERE p.id = :id")
    Optional<Projekat> findByIdWithKorisnici(@Param("id") Long id);
    @EntityGraph(attributePaths = "korisniciProjekta")
    Set<Projekat> findDistinctByKorisniciProjekta_KorisnikId(Long userId);
}
