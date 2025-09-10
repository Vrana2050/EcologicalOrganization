package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.StatistikaProjektnihDokumenata;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IStatistikaProjektnihDokumenataRepository;
import DocumentPreparationService.service.interfaces.IStatistikaProjektnihDokumenataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class StatistikaProjektnihDokumenataService extends CrudService<StatistikaProjektnihDokumenata,Long> implements IStatistikaProjektnihDokumenataService {
    protected StatistikaProjektnihDokumenataService(IStatistikaProjektnihDokumenataRepository repository) {
        super(repository);
    }
}
