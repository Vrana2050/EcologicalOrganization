package DocumentPreparationService.service;

import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IFajlRepository;
import DocumentPreparationService.service.interfaces.IFajlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class FajlService extends CrudService<Fajl,Long> implements IFajlService {

    @Autowired
    private DokumentService dokumentService;
    protected FajlService(IFajlRepository repository) {
        super(repository);
    }
    @Override
    public Fajl create(Fajl fajl) {
        fajl.validate();
        return super.create(fajl);
    }

    public Fajl createNewVerzija(Set<Fajl> sviFajlovi, Fajl newFajl) {
        newFajl.updateVerzija(sviFajlovi);
        newFajl.validate();
        return create(newFajl);
    }

    @Override
    @Transactional
    public Fajl uploadFajl(Long dokumentId, Long userId, Fajl newFajl){
        Dokument dokument = dokumentService.getDokumentWithFiles(dokumentId);
        if(dokument == null){
            throw new NotFoundException("Dokument not found");
        }
        Fajl savedFajl = null;
        for(Fajl fajl : dokument.getAktivniFajlovi()){
            if(fajl.isNewVerzija(newFajl)) {
                savedFajl = createNewVerzija(dokument.getSviFajlovi(),newFajl);
                dokument.getAktivniFajlovi().remove(fajl);
            }
        }
        if(savedFajl == null)
        {
            savedFajl = create(newFajl);
        }
        dokument.getAktivniFajlovi().add(savedFajl);
        dokument.getSviFajlovi().add(savedFajl);
        dokument = dokumentService.updateDokumentFiles(dokument,userId);
        return savedFajl;
    }

    @Override
    public Set<Fajl> findAllByDokument(Long dokumentId, Long userId) {
        return dokumentService.getDokumentSveFajlove(dokumentId,userId);
    }

    @Override
    public Set<Fajl> findAllActiveByDokument(Long dokumentId, Long userId) {
        return dokumentService.getDokumentAktivneFajlove(dokumentId,userId);
    }
}
