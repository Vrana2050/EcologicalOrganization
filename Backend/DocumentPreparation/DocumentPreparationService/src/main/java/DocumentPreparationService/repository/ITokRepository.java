package DocumentPreparationService.repository;

import DocumentPreparationService.model.Tok;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITokRepository extends ICrudRepository<Tok, Long> {

}
