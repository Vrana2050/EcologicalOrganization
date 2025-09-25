package DocumentPreparationService.repository;

import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.model.TokStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface ITokRepository extends ICrudRepository<Tok, Long> {
}
