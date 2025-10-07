package DocumentPreparationService.service;

import DocumentPreparationService.dto.DokumentAktivniFajlDto;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.*;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IFajlRepository;
import DocumentPreparationService.service.interfaces.IDokumentAktivniFajlService;
import DocumentPreparationService.service.interfaces.IFajlService;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FajlService extends CrudService<Fajl,Long> implements IFajlService {

    @Autowired
    private DokumentService dokumentService;
    @Autowired
    private IFajlRepository fajlRepository;
    @Autowired
    private IKorisnikProjekatService  korisnikProjekatService;
    @Autowired
    private IDokumentAktivniFajlService  dokumentAktivniFajlService;

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
        Fajl savedFajl = null;
        Set<DokumentAktivniFajl> dokumentAktivniFajlovi = dokumentAktivniFajlService.findByDokumentIdWithFajl(dokumentId);
        Dokument dokument = dokumentService.findByIdWithAllFajlovi(dokumentId);
        for(DokumentAktivniFajl daf : dokumentAktivniFajlovi){
            if(daf.getFajl().isNewVerzija(newFajl)) {
                savedFajl = createNewVerzija(dokument.getSviFajlovi(),newFajl);
                daf.setFajl(savedFajl);
            }
        }
        if(savedFajl == null){
            savedFajl = create(newFajl);
            DokumentAktivniFajl daf = new DokumentAktivniFajl();
            daf.setFajl(savedFajl);
            daf.setDokument(dokument);
            dokumentAktivniFajlService.create(daf);
        }
        dokument.getSviFajlovi().add(savedFajl);
        dokument = dokumentService.updateDokumentFiles(dokument,userId);
        return savedFajl;
    }

    @Override
    public Set<Fajl> findAllByDokument(Long dokumentId, Long userId) {
        return dokumentService.getDokumentSveFajlove(dokumentId,userId);
    }

    @Override
    public Set<DokumentAktivniFajl> findAllActiveByDokument(Long dokumentId, Long userId) {
        Dokument dokument = dokumentService.findById(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));;
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
        return dokumentAktivniFajlService.findByDokumentIdWithFajl(dokumentId);
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
        DokumentAktivniFajl aktivniFajl = dokumentAktivniFajlService.findById(aktivniFajlId).orElseThrow(() -> new NotFoundException("Document not found"));
        Dokument dokument = dokumentService.findById(aktivniFajl.getDokument().getId()).orElseThrow(() -> new NotFoundException("Document not found"));;
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
        return fajlRepository.findOtherVersions(aktivniFajlId,offset,size);
    }

    @Override
    @Transactional
    public Fajl restoreFajl(Long userId, Fajl fajl,Long dokumentAktivniFajlId) {
        Fajl fajlToRestore = fajlRepository.findById(fajl.getId()).orElseThrow(() -> new NotFoundException("File not found"));
        DokumentAktivniFajl daf = dokumentAktivniFajlService.findById(dokumentAktivniFajlId).orElseThrow(() -> new NotFoundException("Document active file not found"));
        Dokument dokumentToUpdate = dokumentService.findByIdEager(daf.getDokument().getId());
        daf.setFajl(fajlToRestore);
        dokumentAktivniFajlService.create(daf);
        if(dokumentToUpdate.getGlavniFajl().getId().equals(daf.getFajl().getId())) {
            dokumentToUpdate.setGlavniFajl(fajlToRestore);
        }
        dokumentService.updateDokumentFiles(dokumentToUpdate,userId);
        return fajlToRestore;
    }

}
