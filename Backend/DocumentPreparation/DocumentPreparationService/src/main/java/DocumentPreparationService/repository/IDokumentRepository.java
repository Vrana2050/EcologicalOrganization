package DocumentPreparationService.repository;

import DocumentPreparationService.model.Dokument;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

@Repository
public interface IDokumentRepository extends ICrudRepository<Dokument, Long> {

    Set<Dokument> findAllByZavisiOdIn(Set<Dokument> zavisiOds);
    @Query("SELECT d FROM Dokument d " +
            "LEFT JOIN FETCH d.projekat " +
            "LEFT JOIN FETCH d.tokIzradeDokumenta " +
            "LEFT JOIN FETCH d.status " +
            "LEFT JOIN FETCH d.roditeljDokument " +
            "LEFT JOIN FETCH d.vlasnik " +
            "LEFT JOIN FETCH d.zavisiOd " +
            "LEFT JOIN FETCH d.dodeljeniKorisnici " +
            "LEFT JOIN FETCH d.revizije " +
            "WHERE d.id = :id")
    Optional<Dokument> findByIdEager(@Param("id") Long id);
}