package DocumentPreparationService.repository;

import DocumentPreparationService.model.StatistikaProjektnihDokumenata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IStatistikaProjektnihDokumenataRepository extends ICrudRepository<StatistikaProjektnihDokumenata, Long> {

}
