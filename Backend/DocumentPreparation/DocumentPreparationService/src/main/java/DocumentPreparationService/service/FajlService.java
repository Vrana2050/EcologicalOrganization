package DocumentPreparationService.service;

import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IFajlRepository;
import DocumentPreparationService.service.interfaces.IFajlService;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class FajlService extends CrudService<Fajl,Long> implements IFajlService {

    @Autowired
    private DokumentService dokumentService;
    @Autowired
    private IFajlRepository fajlRepository;
    @Autowired
    private IKorisnikProjekatService  korisnikProjekatService;
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

    @Override
    public Set<Fajl> findAllByDokumentForRevizija(Long dokumentId, Long userId) {
        Dokument dokument = dokumentService.findById(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));;
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
        return fajlRepository.getFajloviForRevizija(dokumentId);
    }
    @Override
    public Set<Fajl> findAllFileVersions(Long aktivniFajlId, Long userId,int page,int size){
        int offset = page * size;
        //TREBA MI AKTIVNI FAJL SERVICE
      /*  Dokument dokument = dokumentService.findById(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));;
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));*/
        return fajlRepository.findOtherVersions(aktivniFajlId,offset,size);
    }
    
}
