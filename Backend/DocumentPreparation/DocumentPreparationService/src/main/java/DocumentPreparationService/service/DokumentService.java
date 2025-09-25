package DocumentPreparationService.service;

import DocumentPreparationService.exception.ForbiddenException;
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

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
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
    private EntityManager entityManager;
    protected DokumentService(IDokumentRepository repository) {
        super(repository);
    }
    @Override
    @Transactional
    public Dokument create(Dokument newDokument) {
        Projekat projekat = projekatService.findById(newDokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("Project not found"));;
        projekat.setTokProjekta(projekat.getTokProjekta());
        newDokument.setProjekat(projekat);
        if(newDokument.getRoditeljDokument()!=null){
            newDokument.setRoditeljDokument(repository.findById(newDokument.getRoditeljDokument().getId()).orElseThrow(() -> new NotFoundException("Parent document not found")));
            Tok tok = tokService.findById(newDokument.getRoditeljDokument().getTokIzradeDokumenta().getId()).orElseThrow(() -> new NotFoundException("Workflow not found"));
            newDokument.setStatus(tokService.getFirstStatus(tok));
        }
        else {
            Tok tok = tokService.findById(projekat.getTokProjekta().getId()).orElseThrow(() -> new NotFoundException("Workflow not found"));
            newDokument.setStatus(tokService.getFirstStatus(tok));
        }
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findById(newDokument.getVlasnik().getId()).orElseThrow(() -> new NotFoundException("Owner not found"));
        newDokument.setVlasnik(korisnikProjekat);
        if(newDokument.getZavisiOd()!=null)
        {
            Set<Dokument> zavisiOd = repository.findAllByZavisiOdIn((newDokument.getZavisiOd()));
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
        if(newDokument.getTokIzradeDokumenta()!=null) {
            Tok tok = tokService.findById(newDokument.getTokIzradeDokumenta().getId()).orElseThrow(() -> new NotFoundException("Workflow not found"));
            oldDokument.setTokIzradeDokumenta(tok);
        }
        if(newDokument.getProjekat()!=null) {
            oldDokument.setProjekat(newDokument.getProjekat());
        }
        if(newDokument.getVlasnik()!=null) {
            newDokument.setVlasnik(korisnikProjekatService.findById(newDokument.getVlasnik().getId()).orElseThrow(() -> new NotFoundException("Owner not found")));
        }
        if(newDokument.getDodeljeniKorisnici()!=null) {
            oldDokument.setDodeljeniKorisnici(korisnikProjekatService.findByIds(newDokument.getDodeljeniKorisnici().stream().map(KorisnikProjekat::getId).collect(Collectors.toSet())));
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
         Dokument updatedDokument = update(newDokument,userId);
         if(updatedDokument.getStatus().isDone()) {
            obavestenjeService.creatDoneObavestenje(updatedDokument.getVlasnik(),updatedDokument);
            if(updatedDokument.getRoditeljDokument()!=null) {
                updateFajloveInParentDokument(updatedDokument.getRoditeljDokument(),updatedDokument.getAktivniFajlovi());
            }
         }
        if(updatedDokument.getStatus().isInReview()) {
            obavestenjeService.creatReviewObavestenje(updatedDokument.getVlasnik(),updatedDokument);
        }
         return updatedDokument;
    }

    private void updateFajloveInParentDokument(Dokument roditeljDokument,Set<Fajl> aktivniFajlovi) {
        roditeljDokument.getSviFajlovi().addAll(aktivniFajlovi);
        Set<Fajl> fajloviForDeletion = new HashSet<>();
        for(Fajl fajl : aktivniFajlovi)
        {
            for(Fajl roditeljAktivniFajl : roditeljDokument.getAktivniFajlovi())
            {
                if(fajl.isNewVerzija(roditeljAktivniFajl))
                {
                    fajloviForDeletion.add(roditeljAktivniFajl);
                }

            }
        }
        roditeljDokument.getAktivniFajlovi().removeAll(fajloviForDeletion);
        roditeljDokument.getAktivniFajlovi().addAll(aktivniFajlovi);
        super.update(roditeljDokument);
    }

    @Override
    public Dokument create(Dokument newDokument, Long userId) {
        Dokument dokument =  repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        if(dokument.getRoditeljDokument()!=null) {
            if(dokument.getStatus().getTrenutnoStanje().getDozvolaDodavanjaZaZaduzenog())
            {
                throw new ForbiddenException("Cannot create a sub-document while the parent document is in its current status.");
            }
        }
        else {
            if(!dokument.getProjekat().isInProgress())
            {
                throw new ForbiddenException("Not allowed to create new document on finished project");
            }
        }
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,newDokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on project"));
        newDokument.setVlasnik(korisnikProjekat);
        return create(newDokument);
    }

    @Override
    public Dokument update(Dokument newDokument, Long userId) {
        Dokument oldDokument =  repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        entityManager.refresh(oldDokument);
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,oldDokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on project"));
        if(oldDokument.hasEditPermission(korisnikProjekat))
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
    public Dokument getDokumentWithFiles(Long dokumentId)
    {
        return repository.findByIdWithFiles(dokumentId);
    }
    @Override
    public Dokument updateDokumentFiles(Dokument dokument, Long userId)
    {
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on project"));
        if(dokument.canUpdate(korisnikProjekat) ) {
            return super.update(dokument);
        }
        else throw new ForbiddenException("User not authorized to update files in this document");
    }

    public Set<Fajl> getDokumentSveFajlove(Long dokumentId, Long userId) {
        Dokument dokument = repository.findByIdWithSviFajlovi(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));

        return dokument.getSviFajlovi();
    }

    @Override
    public Set<Fajl> getDokumentAktivneFajlove(Long dokumentId, Long userId) {
        Dokument dokument = repository.findByIdWithAktivniFajlovi(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new ForbiddenException("Cannot read document on other projects"));
        return dokument.getAktivniFajlovi();
    }
}
