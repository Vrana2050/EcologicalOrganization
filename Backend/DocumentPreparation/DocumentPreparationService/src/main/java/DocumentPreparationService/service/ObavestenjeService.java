package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Obavestenje;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IObavestenjeRepository;
import DocumentPreparationService.service.interfaces.IObavestenjeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class ObavestenjeService extends CrudService<Obavestenje,Long> implements IObavestenjeService {
    protected ObavestenjeService(IObavestenjeRepository repository) {
        super(repository);
    }
}
