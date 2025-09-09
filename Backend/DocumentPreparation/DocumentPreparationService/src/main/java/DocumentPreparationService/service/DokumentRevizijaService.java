package DocumentPreparationService.service;

import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.InvalidRequestDataException;
import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IDokumentRepository;
import DocumentPreparationService.repository.IDokumentRevizijaRepository;
import DocumentPreparationService.service.interfaces.IDokumentRevizijaService;
import DocumentPreparationService.service.interfaces.IDokumentService;
import DocumentPreparationService.service.interfaces.IKorisnikProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class DokumentRevizijaService  extends CrudService<DokumentRevizija,Long>  implements IDokumentRevizijaService {

    @Autowired
    private IDokumentService dokumentService;
    @Autowired
    private IDokumentRevizijaRepository repository;
    @Autowired
    private IKorisnikProjekatService  korisnikProjekatService;
    @Autowired
    protected DokumentRevizijaService(IDokumentRevizijaRepository repository) {
        super(repository);
    }

    @Override
    public DokumentRevizija create(DokumentRevizija dokumentRevizija) {
        Dokument dokument = dokumentService.findById(dokumentRevizija.getDokument().getId()).orElseThrow(() -> new NotFoundException("Document not found"));
        dokumentRevizija.setDokument(dokument);
        dokumentRevizija.setTrenutniStatus(dokument.getStatus());
        dokumentRevizija.validate();
        DokumentRevizija savedDokumentRevizija = super.create(dokumentRevizija);
        TokStatus newStatus = new TokStatus();
        if(savedDokumentRevizija.getOdobreno())
        {
            newStatus.setId(dokument.getStatus().getSledeceStanje().getId());
            dokument.setStatus(newStatus);
        }
        else {
            newStatus.setId(dokument.getStatus().getStatusNakonOdbijanja().getId());
            dokument.setStatus(newStatus);
        }
        dokumentService.update(dokument,savedDokumentRevizija.getPregledac().getKorisnikId());
        return savedDokumentRevizija;
    }
    @Override
    @Transactional
    public Set<DokumentRevizija> create(Set<DokumentRevizija> dokumentRevizije, Long userId) {
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,dokumentRevizije.stream().findFirst().get().getDokument().getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on document project"));
        for(DokumentRevizija dokumentRevizija : dokumentRevizije)
        {
            dokumentRevizija.setPregledac(korisnikProjekat);
            if(dokumentRevizija.getId()==null){
                create(dokumentRevizija);
            }
            else {
                update(dokumentRevizija);
            }
        }
        return dokumentRevizije;
    }

    @Override
    public Set<DokumentRevizija> findAllByDokument(Long dokumentId, Long userId) {
        Dokument dokument = dokumentService.findById(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on document project"));
        return repository.getAllByDokument(dokument);
    }
    @Override
    public DokumentRevizija update(DokumentRevizija newDokumentRevizija) {
        DokumentRevizija oldDokumentRevizija = repository.findById(newDokumentRevizija.getId()).orElseThrow(() -> new NotFoundException("Review not found"));
        oldDokumentRevizija.update(newDokumentRevizija);
        return super.update(oldDokumentRevizija);
    }
    @Override
    @Transactional
    public Set<DokumentRevizija> update(Set<DokumentRevizija> revizije, Long userId) {
        DokumentRevizija dR = repository.findByIdWithDokument(revizije.stream().findFirst().get().getId()).orElseThrow(() -> new NotFoundException("Review not found"));
        if(!revizije.stream().allMatch(revizija -> revizija.getDokument().getId().equals(dR.getDokument().getId())))
        {
            throw new InvalidRequestDataException("Cannot update reviews on different documents");
        }
        boolean isKorisnikDodeljenik = korisnikProjekatService.isKorisnikDodeljenik(userId,dR.getDokument().getProjekat().getId(), dR.getId());
        if(!isKorisnikDodeljenik)
        {
            throw new ForbiddenException("Cannot update reviews on non assigned documents");
        }
        for(DokumentRevizija dokumentRevizija : revizije)
        {
                update(dokumentRevizija);
        }
        return revizije;
    }
    @Override
    public Set<DokumentRevizija> findAllByDokumentState(Long dokumentId, Long userId) {
        Dokument dokument = dokumentService.findById(dokumentId).orElseThrow(() -> new NotFoundException("Document not found"));
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,dokument.getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on document project"));
        return repository.getAllByDokumentAndTrenutniStatus_Id(dokument,dokument.getStatus().getId());
    }

}
