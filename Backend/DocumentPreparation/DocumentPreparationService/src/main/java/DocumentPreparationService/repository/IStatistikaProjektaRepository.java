package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.StatistikaProjekta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IStatistikaProjektaRepository extends ICrudRepository<StatistikaProjekta, Long> {

}
