package DocumentPreparationService.service;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IDokumentRepository;
import DocumentPreparationService.service.interfaces.IDokumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class DokumentService extends CrudService<Dokument,Long> implements IDokumentService {

    protected DokumentService(IDokumentRepository repository) {
        super(repository);
    }
}
