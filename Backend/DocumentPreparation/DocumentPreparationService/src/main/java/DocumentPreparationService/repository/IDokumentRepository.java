package DocumentPreparationService.repository;

import DocumentPreparationService.model.Dokument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IDokumentRepository extends ICrudRepository<Dokument, Long> {

}