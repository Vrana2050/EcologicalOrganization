package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.RevizijaIzmena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IRevizijaIzmenaRepository extends ICrudRepository<RevizijaIzmena, Long> {

}
