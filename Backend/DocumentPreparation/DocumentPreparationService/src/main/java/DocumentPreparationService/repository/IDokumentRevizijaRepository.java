package DocumentPreparationService.repository;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface IDokumentRevizijaRepository extends ICrudRepository<DokumentRevizija, Long> {

    Set<DokumentRevizija> getAllByDokument(Dokument dokument);

    Set<DokumentRevizija> getAllByDokumentAndTrenutniStatus_Id(Dokument dokument, Long trenutniStatusId);

    @Query("SELECT d FROM DokumentRevizija d JOIN FETCH d.dokument WHERE d.id = :id")
    Optional<DokumentRevizija> findByIdWithDokument(@Param("id") Long id);

    Set<DokumentRevizija> findALlByDokument_Id(Long dokumentId);
}