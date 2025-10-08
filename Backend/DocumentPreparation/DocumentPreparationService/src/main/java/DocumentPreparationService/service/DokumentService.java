package DocumentPreparationService.service;

import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.InvalidRequestDataException;
import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.*;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IDokumentRepository;
import DocumentPreparationService.service.interfaces.*;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DokumentService extends CrudService<Dokument,Long> implements IDokumentService {

    @Autowired
    private IDokumentRepository repository;
    @Autowired
    private IProjekatService projekatService;
    @Autowired
    private ITokService tokService;
    @Autowired
    private ITokStatusService tokStatusService;
    @Autowired
    private IKorisnikProjekatService korisnikProjekatService;
    @Autowired
    private IObavestenjeService obavestenjeService;
    @Autowired
    private IDokumentAktivniFajlService  dokumentAktivniFajlService;
    @Autowired
    private EntityManager entityManager;
    protected DokumentService(IDokumentRepository repository) {
        super(repository);
    }
    @Override
    @Transactional
    public Dokument create(Dokument newDokument) {
        Projekat projekat = projekatService.findByIdEager(newDokument.getProjekat().getId());
        projekat.setTokProjekta(projekat.getTokProjekta());
        newDokument.setProjekat(projekat);
        newDokument.setDatumKreiranja(LocalDate.now());
        if(newDokument.getRoditeljDokument()!=null){
            newDokument.setRoditeljDokument(repository.findByIdEager(newDokument.getRoditeljDokument().getId()).orElseThrow(() -> new NotFoundException("Parent document not found")));
            Tok tok = tokService.findById(newDokument.getRoditeljDokument().getTokIzradeDokumenta().getId()).orElseThrow(() -> new NotFoundException("Workflow not found"));
            if(!tok.canCreateDocumentInStatus(newDokument.getStatus()))
            {
                throw new ForbiddenException("Cannot create document in selected status");
            }

        }
        else {
            Tok tok = tokService.findById(projekat.getTokProjekta().getId()).orElseThrow(() -> new NotFoundException("Workflow not found"));
            if(!tok.canCreateDocumentInStatus(newDokument.getStatus())){
                throw new ForbiddenException("Cannot create document in selected status");

            }
        }
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findById(newDokument.getVlasnik().getId()).orElseThrow(() -> new NotFoundException("Owner not found"));
        newDokument.setVlasnik(korisnikProjekat);
        if(newDokument.getZavisiOd()!=null)
        {
            Set<Long> ids = newDokument.getZavisiOd()
                    .stream()
                    .map(Dokument::getId)
                    .collect(Collectors.toSet());

            Set<Dokument> zavisiOd = new HashSet<>(repository.findAllByIdEager(ids));
            newDokument.setZavisiOd(zavisiOd);
        }
        if(newDokument.getDodeljeniKorisnici()!=null) {
            Set<KorisnikProjekat> dodeljenici = korisnikProjekatService.findByIds(newDokument.getDodeljeniKorisnici().stream().map(KorisnikProjekat::getId).collect(Collectors.toSet()));
            newDokument.setDodeljeniKorisnici(dodeljenici);
        }
        if(newDokument.getVlasnik()!=null) {
            newDokument.setVlasnik(korisnikProjekatService.findById(newDokument.getVlasnik().getId()).orElseThrow(() -> new NotFoundException("Owner not found")));
        }
        newDokument.validate();
        Dokument savedDokument = super.create(newDokument);
        if(!savedDokument.getPripremna_verzija())
        {
            obavestenjeService.creatNewDokumentObavestenje(savedDokument.getDodeljeniKorisnici(), newDokument);
        }
        return savedDokument;
    }
    @Override
    @Transactional
    public Dokument update(Dokument newDokument) {
        Dokument oldDokument = repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));

        if(oldDokument.getRoditeljDokument()!=null) {
            oldDokument.setRoditeljDokument(repository.findByIdEager(newDokument.getRoditeljDokument().getId()).orElseThrow(() -> new NotFoundException("Parent document not found")));
        }
        else{
            oldDokument.setProjekat(projekatService.findByIdEager(oldDokument.getProjekat().getId()));
        }
        if(newDokument.getTokIzradeDokumenta()!=null) {
            Tok tok = tokService.findById(newDokument.getTokIzradeDokumenta().getId()).orElseThrow(() -> new NotFoundException("Workflow not found"));
            oldDokument.setTokIzradeDokumenta(tok);
        }
        if(newDokument.getProjekat()!=null) {
            oldDokument.setProjekat(projekatService.findByIdEager(newDokument.getProjekat().getId()));
        }
        if(newDokument.getVlasnik()!=null) {
            newDokument.setVlasnik(korisnikProjekatService.findById(newDokument.getVlasnik().getId()).orElseThrow(() -> new NotFoundException("Owner not found")));
        }
        if(newDokument.getDodeljeniKorisnici()!=null) {
            oldDokument.setDodeljeniKorisnici(korisnikProjekatService.findByIds(newDokument.getDodeljeniKorisnici().stream().map(KorisnikProjekat::getId).collect(Collectors.toSet())));
        }
        if(newDokument.getZavisiOd()!=null) {
            Set<Dokument> zavisiOd = repository.findAllByIdEager(newDokument.getZavisiOd().stream().map(Dokument::getId).collect(Collectors.toSet()));
            oldDokument.setZavisiOd(zavisiOd);
        }
        if(newDokument.getStatus()!=null) {
            TokStatus newStatus = tokStatusService.findById(newDokument.getStatus().getId()).orElseThrow(() -> new NotFoundException("Status not found"));
            newDokument.setStatus(newStatus);
        }
        oldDokument.update(newDokument);
        return super.update(oldDokument);
    }
    @Override
    @Transactional
    public Dokument updateStatus(Dokument newDokument,Long userId)
    {
        entityManager.detach(newDokument);
        Dokument dokumentToUpdate = repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        dokumentToUpdate.setStatus(tokStatusService.findById(newDokument.getStatus().getId()).orElseThrow(() -> new NotFoundException("Status not found")));
         Dokument updatedDokument = update(dokumentToUpdate,userId);
         if(updatedDokument.getStatus().isDone()) {
            obavestenjeService.creatDoneObavestenje(updatedDokument.getVlasnik(),updatedDokument);
            if(updatedDokument.getRoditeljDokument()!=null) {
                updateFajloveInParentDokument(updatedDokument.getRoditeljDokument(),updatedDokument);
            }
         }
        if(updatedDokument.getStatus().isInReview()) {
            obavestenjeService.creatReviewObavestenje(updatedDokument.getVlasnik(),updatedDokument);
        }
         return updatedDokument;
    }

    private void updateFajloveInParentDokument(Dokument roditeljDokument,Dokument dokumentNaslednik) {
        if(!roditeljDokument.canEditFiles())
        {
            throw new ForbiddenException("Cannot edit parent document files. Parent document is in review");
        }
        Set<DokumentAktivniFajl> aktivniFajlovi = dokumentAktivniFajlService.findByDokumentIdWithFajl(dokumentNaslednik.getId());
        for(DokumentAktivniFajl aktivniFajl : aktivniFajlovi) {
            roditeljDokument.getSviFajlovi().add(aktivniFajl.getFajl());
        }
        Set<DokumentAktivniFajl> roditeljAktivniFajlovi = dokumentAktivniFajlService.findByDokumentIdWithFajl(roditeljDokument.getId());
        for(DokumentAktivniFajl naslednikAktivniFajl : aktivniFajlovi)
        {
            boolean isNewVersion = false;
            for(DokumentAktivniFajl roditeljAktivniFajl : roditeljAktivniFajlovi)
            {
                if(naslednikAktivniFajl.getFajl().isNewVerzija(roditeljAktivniFajl.getFajl()))
                {
                    isNewVersion = true;
                    if(roditeljDokument.getGlavniFajl().getId().equals(roditeljAktivniFajl.getFajl().getId()))
                    {
                        roditeljDokument.setGlavniFajl(naslednikAktivniFajl.getFajl());
                    }
                    roditeljAktivniFajl.setFajl(naslednikAktivniFajl.getFajl());
                    break;
                }
            }
            if(!isNewVersion){
                    DokumentAktivniFajl daf = new DokumentAktivniFajl();
                    daf.setDokument(roditeljDokument);
                    daf.setFajl(naslednikAktivniFajl.getFajl());
                    roditeljDokument.getAktivniFajlovi().add(daf);
            }

        }
        super.update(roditeljDokument);
    }

    @Override
    public Dokument create(Dokument newDokument, Long userId) {
        KorisnikProjekat korisnikProjekat  = null;
        if(newDokument.getRoditeljDokument()!=null) {
            Dokument roditeljDokument =  repository.findByIdEager(newDokument.getRoditeljDokument().getId()).orElseThrow(() -> new NotFoundException("Parent document not found"));
            korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,roditeljDokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
            if(!roditeljDokument.canAddSubDocument(korisnikProjekat,newDokument.getStatus().getId()))
            {
                throw new ForbiddenException("Cannot create a sub-document in selected status");
            }
        }
        else if(newDokument.getProjekat().getId() != null){
            Projekat projekat = projekatService.findByIdEager(userId,newDokument.getProjekat().getId());
            korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId, projekat.getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
            if(!projekat.canAddDocument(korisnikProjekat,newDokument.getStatus().getId()))
            {
                throw new ForbiddenException("Not allowed to create document in selected status");
            }
        }
        else {
            throw new NotFoundException("No project or parent document found");
        }
        newDokument.setVlasnik(korisnikProjekat);
        newDokument.setIzmenaOd(korisnikProjekat);
        return create(newDokument);
    }

    @Override
    public Dokument update(Dokument newDokument, Long userId) {
        entityManager.detach(newDokument);
        Dokument oldDokument =  repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,oldDokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on project"));
        if(canEdit(oldDokument, korisnikProjekat))
        {
            newDokument.setIzmenaOd(korisnikProjekat);
            Dokument savedDokument = update(newDokument);
            if(!savedDokument.getPripremna_verzija() && oldDokument.getPripremna_verzija()) {
                obavestenjeService.creatNewDokumentObavestenje(savedDokument.getDodeljeniKorisnici(),newDokument);
            }
            return savedDokument;
        }
        else{
           throw new ForbiddenException("User not authorized to update this document");
        }
    }

    @Override
    public boolean delete(Long id, Long userId) {
        return false;
    }

    @Override
    public Dokument findById(Long id, Long userId) {
        Dokument dokument = repository.findByIdEager(id).orElseThrow(() -> new NotFoundException("Document not found"));
        korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));
        return dokument;
    }

    @Override
    public Set<Dokument> findAll(Long userId) {
        Set<KorisnikProjekat>korinsnikProjekti = korisnikProjekatService.findByUser(userId);
        return repository.findAllByAnyDodeljeniKorisnici((korinsnikProjekti));
    }
    @Override
    public Dokument updateDokumentFiles(Dokument dokument, Long userId)
    {
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on project"));
        if(canEditFiles(dokument,korisnikProjekat) ) {
            return super.update(dokument);
        }
        else throw new ForbiddenException("Not authorized to update files in this document");
    }

    public Set<Fajl> getDokumentSveFajlove(Long dokumentId, Long userId) {
        Dokument dokument = repository.findByIdWithSviFajlovi(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));

        return dokument.getSviFajlovi();
    }

    @Override
    public Set<Dokument> findAllBoardDocumentsByProjectId(Long userId, Long projekatId) {
        korisnikProjekatService.findByUserAndProjekat(userId,projekatId).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));
        Set<Dokument> boardDocuments = repository.getAllBoardDocumentsByProjectId(projekatId);
        return boardDocuments;
    }

    @Override
    public Set<Dokument> findAllBoardDocumentsByParentDocumentId(Long userId, Long parentDocumentId) {
        Dokument roditeljDokument =  repository.findById(parentDocumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        korisnikProjekatService.findByUserAndProjekat(userId, roditeljDokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));
        Set<Dokument> boardDocuments = repository.getAllBoardDocumentsByParentDocumentId(parentDocumentId);
        return boardDocuments;
    }

    public Dokument findByIdWithAllFajlovi(Long dokumentId) {
        return repository.findByIdWithSviFajlovi(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
    }

    @Override
    public Set<Dokument> getAllDocumentsOnProject(Long userId, Long projekatId) {
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId,projekatId).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));
        return repository.getAllDokumentiOnProjekat(projekatId);
    }

    @Override
    public Set<Dokument> getAllDocumentsOnParentDocument(Long userId, Long dokumentId) {
        Dokument roditeljDokument =  repository.findById(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId,roditeljDokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));
        return repository.getAllDokumentiOnRoditeljDokument(dokumentId);
    }

    @Override
    public Dokument findByIdEager(Long id) {
        return  repository.findByIdEager(id).orElseThrow(() -> new NotFoundException("Document not found"));
    }

    @Override
    public Dokument updateWorkflow(Dokument newDokument, Long userId) {
        Dokument dokumentToUpdate = repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        dokumentToUpdate.setTokIzradeDokumenta(newDokument.getTokIzradeDokumenta());
        return update(dokumentToUpdate,userId);
    }

    @Override
    public Dokument updateMainFile(Dokument dokument, Long userId) {
        DokumentAktivniFajl daf = dokumentAktivniFajlService.findByDokumentAndFajl(dokument.getId(),dokument.getGlavniFajl().getId());
        Dokument dokumentToUpdate = repository.findByIdEager(dokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        if(daf == null){
            throw new NotFoundException("Document active file not found");
        }
        dokumentToUpdate.setGlavniFajl(dokument.getGlavniFajl());
        return updateDokumentFiles(dokumentToUpdate,userId);
    }

    @Override
    public Dokument updateDependencies(Dokument newDokument, Long userId) {
       Dokument dokumenToUpdate = repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
       for(Dokument dokument : newDokument.getZavisiOd()){
           Dokument zavisiOd = repository.findByIdEager(dokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
           if(!dokumenToUpdate.isRokZavrsetkaAfter(zavisiOd.getRokZavrsetka())){
               throw new InvalidRequestDataException("Dependency due date must not be later than the due date of the document it depends on.");
           }
       }
       dokumenToUpdate.setZavisiOd(newDokument.getZavisiOd());
       return update(dokumenToUpdate,userId);
    }

    @Override
    public Set<Dokument> findAllParentDocuments(Long userId, Long dokumentId) {
        Dokument dokument = repository.findByIdEager(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
        if(!dokument.isKorisnikDodeljenik(kp) && !dokument.isKorisnikVlasnik(kp))
        {
            throw new  ForbiddenException("Document not found");

        }
        if(dokument.getRoditeljDokument()==null)
        {
            return repository.getAllDokumentiOnProjekat(dokument.getProjekat().getId());
        }
        else {
            return repository.getAllDokumentiOnRoditeljDokument(dokument.getRoditeljDokument().getId());
        }
    }

    private boolean canEditFiles(Dokument dokument,KorisnikProjekat korisnikProjekat) {
        return canEdit(dokument,korisnikProjekat) && dokument.canUpdate(korisnikProjekat) &&  dokument.canEditFiles();
    }

    private boolean canEdit(Dokument oldDokument,KorisnikProjekat korisnikProjekat) {
        if(!oldDokument.hasEditPermission(korisnikProjekat))
            return false;
        if(oldDokument.isSubDocument()) {
            Dokument roditeljDokument = repository.findByIdEager(oldDokument.getRoditeljDokument().getId()).orElseThrow(() -> new NotFoundException("Document not found"));
            if (roditeljDokument.isInReview())
            {
                throw new ForbiddenException("Cannot edit document. Parent document is in review");
            }
        }
        else {
            Projekat projekat = projekatService.findByIdEager(oldDokument.getProjekat().getId());
            if (projekat.isInProgress())
            {
                return true;
            }
        }
        return false;
    }
}
