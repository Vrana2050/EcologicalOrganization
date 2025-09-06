package DocumentPreparationService.repository;

import DocumentPreparationService.model.TokStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITokStatusRepository extends ICrudRepository<TokStatus, Long> {

}
