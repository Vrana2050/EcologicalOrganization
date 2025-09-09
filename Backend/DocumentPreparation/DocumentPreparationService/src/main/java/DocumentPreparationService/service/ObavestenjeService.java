package DocumentPreparationService.service;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Obavestenje;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IObavestenjeRepository;
import DocumentPreparationService.service.interfaces.IObavestenjeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class ObavestenjeService extends CrudService<Obavestenje,Long> implements IObavestenjeService {
    @Autowired
    private IObavestenjeRepository repository;
    protected ObavestenjeService(IObavestenjeRepository repository) {
        super(repository);
    }

    @Override
    public Obavestenje markAsRead(Obavestenje newObavestenje,Long userId) {
        Obavestenje oldObavestenje = repository.findById(newObavestenje.getId()).get();
        if(oldObavestenje.markAsRead(userId))
        {
            repository.save(oldObavestenje);
        }
        return oldObavestenje;
    }

    @Override
    public Set<Obavestenje> findAllForUser(Long userId) {
        return repository.findAllByKorisnikId(userId);
    }
    @Transactional
    public void creatNewDokumentObavestenje(Set<KorisnikProjekat> korisnici,Dokument dokument) {
        for(KorisnikProjekat kp : korisnici){
            Obavestenje newObavestenje = new Obavestenje();
            newObavestenje.setKorisnikId(kp.getKorisnikId());
            newObavestenje.setProcitana(false);
            newObavestenje.setPoruka("Korisnik " + dokument.getVlasnik().getKorisnikId() + " vam je dodelio rad na dokumentu " + dokument.getNaziv());
            newObavestenje.setDokument(dokument);
            repository.save(newObavestenje);
        }
    }
    @Transactional
    public void creatReviewObavestenje(KorisnikProjekat korisnik,Dokument dokument) {
            Obavestenje newObavestenje = new Obavestenje();
            newObavestenje.setKorisnikId(korisnik.getKorisnikId());
            newObavestenje.setProcitana(false);
            newObavestenje.setPoruka("Dokument " + dokument.getNaziv() + "ceka na odobrenje");
            newObavestenje.setDokument(dokument);
            repository.save(newObavestenje);
    }
    @Transactional
    public void creatDoneObavestenje(KorisnikProjekat korisnik,Dokument dokument) {
            Obavestenje newObavestenje = new Obavestenje();
            newObavestenje.setKorisnikId(korisnik.getKorisnikId());
            newObavestenje.setProcitana(false);
            newObavestenje.setPoruka("Dokument " + dokument.getNaziv() + "je zavrsen!");
            newObavestenje.setDokument(dokument);
            repository.save(newObavestenje);
    }
    @Transactional
    public void creatReviewResultObavestenje(Set<KorisnikProjekat> korisnici,Dokument dokument,boolean reviewResult) {
        for(KorisnikProjekat kp : korisnici){
            Obavestenje newObavestenje = new Obavestenje();
            newObavestenje.setKorisnikId(kp.getKorisnikId());
            newObavestenje.setProcitana(false);
            String result = reviewResult ? "je dobio odobrenje za nastavak":"nije dobio odobrenje za nastavak";
            newObavestenje.setPoruka("Dokument " + dokument.getNaziv() + result + "!");
            newObavestenje.setDokument(dokument);
            repository.save(newObavestenje);
        }
    }
}
