package DocumentPreparationService.service;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IKorisnikProjekatRepository;
import DocumentPreparationService.service.interfaces.IFajlService;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
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

    public Optional<KorisnikProjekat> findByUserAndProjekat(Long userId, Long projekatId) {
        return repository.findByProjekatIdAndKorisnikId(projekatId,userId);
    }

    public Set<KorisnikProjekat> findByUser(Long userId) {
        return repository.findAllByKorisnikId(userId);
    }

    @Override
    public boolean isKorisnikDodeljenik(Long userId, Long projekatId, Long dokumentId) {
        Optional<KorisnikProjekat> optionalKp = findByUserAndProjekatWithDocuments(userId, projekatId);
        if (optionalKp.isEmpty()) {
            return false;
        }

        KorisnikProjekat kp = optionalKp.get();
        for (Dokument dokument : kp.getDokumenti()) {
            if (dokument.getId().equals(dokumentId)) {
                return true;
            }
        }
        return false;
    }

    private Optional<KorisnikProjekat> findByUserAndProjekatWithDocuments(Long userId, Long projekatId) {
        return repository.findByUserAndProjekatWithDocuments(userId,projekatId);
    }
}
