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
import org.springframework.transaction.annotation.Propagation;
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
                if(dokument.isFajlGlavniFajl(daf.getFajl().getId())){
                    dokument.setGlavniFajl(savedFajl);
                }
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
        if(dokumentToUpdate.isFajlGlavniFajl(daf.getFajl().getId())) {
            dokumentToUpdate.setGlavniFajl(fajlToRestore);
        }
        daf.setFajl(fajlToRestore);
        dokumentAktivniFajlService.create(daf);
        dokumentService.updateDokumentFiles(dokumentToUpdate,userId);
        return fajlToRestore;
    }

    @Override
    @Transactional
    public boolean deleteAktivniFajl(Long aktivniFajlId, Long userId) {
        DokumentAktivniFajl daf = dokumentAktivniFajlService.findById(aktivniFajlId).orElseThrow(() -> new NotFoundException("Active file not found"));
        Dokument dokument = dokumentService.findByIdWithAllFajlovi(daf.getDokument().getId());
        Fajl aktivniFajl = fajlRepository.findById(daf.getFajl().getId()).orElseThrow(() -> new NotFoundException("File not found"));
        Set<Fajl> fajloviToDelete = dokument.getSviFajlovi().stream().filter(fajl->aktivniFajl.isNewVerzija(fajl)).collect(Collectors.toSet());
        dokument.setSviFajlovi(dokument.getSviFajlovi().stream().filter(fajl -> !fajloviToDelete.contains(fajl)).collect(Collectors.toSet()));
        if(dokument.isFajlGlavniFajl(daf.getFajl().getId())) {
            dokument.setGlavniFajl(null);
        }
        dokumentAktivniFajlService.delete(daf.getId());
        for(Fajl fajl : fajloviToDelete){
            if(!fileExistsInOtherDocuments(fajl,dokument)) {
                fajlRepository.delete(fajl);
            }
        }
        dokumentService.updateDokumentFiles(dokument,userId);
        return true;
    }

    @Override
    public DokumentAktivniFajl getAktivniFajlByDokumentAndFajl(Long dokumentId, Long fajlId, Long userId) {
        Dokument dokument = dokumentService.findById(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
        return dokumentAktivniFajlService.findByDokumentAndFajl(dokumentId,fajlId);
    }
    private boolean fileExistsInOtherDocuments(Fajl fajl,Dokument dokument) {
        return fajlRepository.fileExistsInOtherDocument(fajl.getId(),dokument.getId());
    }

}
