package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.StatistikaProjekta;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IStatistikaProjektaRepository;
import DocumentPreparationService.service.interfaces.IStatistikaProjektaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class StatistikaProjektaService extends CrudService<StatistikaProjekta,Long> implements IStatistikaProjektaService {
    protected StatistikaProjektaService(IStatistikaProjektaRepository repository) {
        super(repository);
    }
}
