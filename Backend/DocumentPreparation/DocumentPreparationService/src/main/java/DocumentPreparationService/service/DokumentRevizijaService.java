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
import DocumentPreparationService.service.interfaces.IObavestenjeService;
import jakarta.ws.rs.InternalServerErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DokumentRevizijaService  extends CrudService<DokumentRevizija,Long>  implements IDokumentRevizijaService {

    @Autowired
    private IDokumentService dokumentService;
    @Autowired
    private IDokumentRevizijaRepository repository;
    @Autowired
    private IKorisnikProjekatService  korisnikProjekatService;
    @Autowired
    private IObavestenjeService  obavestenjeService;
    protected DokumentRevizijaService(IDokumentRevizijaRepository repository) {
        super(repository);
    }

    @Override
    public DokumentRevizija create(DokumentRevizija dokumentRevizija) {
        Dokument dokument = dokumentService.findByIdEager(dokumentRevizija.getDokument().getId());
        if(!canReview(dokument, dokumentRevizija.getPregledac()))
        {
            throw new ForbiddenException("Cannot review document");
        }
        dokumentRevizija.setDokument(dokument);
        dokumentRevizija.setTrenutniStatus(dokument.getStatus());
        dokumentRevizija.setDatumRevizije(LocalDate.now());
        dokumentRevizija.validate();
        DokumentRevizija savedDokumentRevizija = super.create(dokumentRevizija);
        TokStatus newStatus = new TokStatus();
        if(savedDokumentRevizija.getOdobreno())
        {
            newStatus.setId(dokument.getStatus().getSledeceStanje().getId());
        }
        else {
            newStatus.setId(dokument.getStatus().getStatusNakonOdbijanja().getId());
        }
        dokument.setStatus(newStatus);
        Dokument savedDokument = dokumentService.updateStatus(dokument,savedDokumentRevizija.getPregledac().getKorisnikId());
        obavestenjeService.creatReviewResultObavestenje(savedDokument.getDodeljeniKorisnici(),savedDokument,savedDokumentRevizija.getOdobreno());
        return savedDokumentRevizija;
    }
    @Override
    @Transactional
    public Set<DokumentRevizija> create(Set<DokumentRevizija> dokumentRevizije, Long userId) {
        KorisnikProjekat korisnikProjekat = korisnikProjekatService.findByUserAndProjekat(userId,dokumentRevizije.stream().findFirst().get().getDokument().getProjekat().getId()).orElseThrow(() -> new NotFoundException("User not found on document project"));
        //MORA SE POSLATI DOKUMENTID AKO IMAM VREMENA DA NAMESTIM
        /*DokumentRevizija dR = repository.findByIdWithDokument(
                dokumentRevizije.stream()
                        .filter(r -> r.getId()!=null)
                        .findFirst()
                        .orElseThrow(() -> new NotFoundException("Review not found"))
                        .getId()
        ).orElseThrow(() -> new NotFoundException("Review not found"));        if(!dokumentRevizije.stream().allMatch(revizija -> revizija.getDokument().getId().equals(dR.getDokument().getId())))
        {
            throw new InvalidRequestDataException("Cannot update reviews on different documents");
        }*/
        boolean isNewDokumentRevizjaOdobrena = dokumentRevizije.stream().anyMatch(dr -> dr.getId()==null && dr.isOdobrena());
        boolean areAllRevizijeResolved = dokumentRevizije.stream().allMatch(dr -> dr.isResolved());
        if(isNewDokumentRevizjaOdobrena)
        {
            if(!areAllRevizijeResolved)
            {
                throw new ForbiddenException("Cannot approve document review. Not all issues were resolved");
            }
        }
        else{
            if(areAllRevizijeResolved)
            {
                throw new ForbiddenException("Cannot reject document review. All issues were resolved");
            }
        }
        for(DokumentRevizija dokumentRevizija : dokumentRevizije)
        {
            if(dokumentRevizija.getId()==null){
                dokumentRevizija.setPregledac(korisnikProjekat);
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
    private boolean canReview(Dokument dokumentToReview,KorisnikProjekat korisnikProjekat)
    {
        if(!dokumentToReview.isInReview()){
            return false;
        }
        if(dokumentToReview.isSubDocument()) {
            Dokument roditeljDokument = dokumentService.findById(dokumentToReview.getRoditeljDokument().getId(), korisnikProjekat.getKorisnikId());
            if(!roditeljDokument.isKorisnikDodeljenik(korisnikProjekat))
            {
                throw new ForbiddenException("Cannot review document. Only assignees on parent document can review.");
            }
            return true;
        }
        else{
            if(!dokumentToReview.isKorisnikVlasnik(korisnikProjekat))
            {
                throw new ForbiddenException("Cannot review document. Only owner of project can review.");
            }
            return true;
        }
    }

}
