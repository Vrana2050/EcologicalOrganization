package DocumentPreparationService.service;

import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.*;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IDokumentRepository;
import DocumentPreparationService.service.interfaces.IDokumentService;
import DocumentPreparationService.service.interfaces.IProjekatService;
import DocumentPreparationService.service.interfaces.ITokService;
import DocumentPreparationService.service.interfaces.ITokStatusService;
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
    private KorisnikProjekatService korisnikProjekatService;
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
        newDokument.validate();
        return super.create(newDokument);
    }
    @Override
    @Transactional
    public Dokument update(Dokument newDokument) {
        Dokument oldDokument = repository.findByIdEager(newDokument.getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        if(newDokument.getTokIzradeDokumenta()!=null) {
            Tok tok = tokService.findById(newDokument.getTokIzradeDokumenta().getId()).orElseThrow(() -> new NotFoundException("Workflow not found"));
            newDokument.setTokIzradeDokumenta(tok);
        }
        if(newDokument.getProjekat()!=null) {
            newDokument.setProjekat(newDokument.getProjekat());
        }
        TokStatus newStatus = tokStatusService.findById(newDokument.getStatus().getId()).orElseThrow(() -> new NotFoundException("Status not found"));
        newDokument.setStatus(newStatus);
        oldDokument.update(newDokument);
        return super.update(newDokument);
    }

    @Override
    public Dokument create(Dokument entity, Long userId) {
        return null;
    }

    @Override
    public Dokument update(Dokument entity, Long userId) {
        return null;
    }

    @Override
    public boolean delete(Long id, Long userId) {
        return false;
    }

    @Override
    public Optional<Dokument> findById(Long id, Long userId) {
        return repository.findByIdEager(id);
    }

    @Override
    public Set<Dokument> findAll(Long userId) {
        return Set.of();
    }
}
