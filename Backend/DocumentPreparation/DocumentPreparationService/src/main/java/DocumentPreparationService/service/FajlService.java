package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IFajlRepository;
import DocumentPreparationService.service.interfaces.IFajlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class FajlService extends CrudService<Fajl,Long> implements IFajlService {
    protected FajlService(IFajlRepository repository) {
        super(repository);
    }
}
