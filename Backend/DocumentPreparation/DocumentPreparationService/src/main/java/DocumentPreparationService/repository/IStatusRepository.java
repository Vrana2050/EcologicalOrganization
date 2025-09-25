package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IStatusRepository extends ICrudRepository<Status, Long> {

}
