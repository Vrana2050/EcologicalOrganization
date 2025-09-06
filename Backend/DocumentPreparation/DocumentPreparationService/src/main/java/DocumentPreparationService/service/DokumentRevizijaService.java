package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IDokumentRepository;
import DocumentPreparationService.repository.IDokumentRevizijaRepository;
import DocumentPreparationService.service.interfaces.IDokumentRevizijaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class DokumentRevizijaService  extends CrudService<DokumentRevizija,Long>  implements IDokumentRevizijaService {

    protected DokumentRevizijaService(IDokumentRevizijaRepository repository) {
        super(repository);
    }
}
