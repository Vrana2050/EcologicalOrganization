package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IKorisnikProjekatRepository;
import DocumentPreparationService.service.interfaces.IFajlService;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class KorisnikProjekatService extends CrudService<KorisnikProjekat,Long> implements IKorisnikProjekatService {

    protected KorisnikProjekatService(IKorisnikProjekatRepository repository) {
        super(repository);
    }

}
