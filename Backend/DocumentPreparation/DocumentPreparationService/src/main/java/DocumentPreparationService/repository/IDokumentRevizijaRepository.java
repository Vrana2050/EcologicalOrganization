package DocumentPreparationService.repository;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IDokumentRevizijaRepository extends ICrudRepository<DokumentRevizija, Long> {

}