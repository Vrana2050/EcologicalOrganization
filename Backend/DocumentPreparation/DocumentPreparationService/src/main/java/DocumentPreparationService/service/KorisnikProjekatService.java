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

import java.util.Set;
import java.util.stream.Stream;

@Service
public class KorisnikProjekatService extends CrudService<KorisnikProjekat,Long> implements IKorisnikProjekatService {

    @Autowired
    IKorisnikProjekatRepository repository;
    protected KorisnikProjekatService(IKorisnikProjekatRepository repository) {
        super(repository);
    }

    @Override
    public Set<KorisnikProjekat> findByIds(Set<Long> ids) {
        return repository.findAllByIdIn(ids);
    }
}
