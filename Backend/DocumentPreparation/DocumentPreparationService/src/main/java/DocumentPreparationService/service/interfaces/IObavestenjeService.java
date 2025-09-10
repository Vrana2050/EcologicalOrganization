package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Obavestenje;

import java.util.Set;

public interface IObavestenjeService extends ICrudService<Obavestenje,Long>{
    Obavestenje markAsRead(Obavestenje obavestenje,Long userId);

    Set<Obavestenje> findAllForUser(Long userId);
    public void creatReviewResultObavestenje(Set<KorisnikProjekat> korisnici, Dokument dokument, boolean reviewResult);
    public void creatDoneObavestenje(KorisnikProjekat korisnik,Dokument dokument);
    public void creatReviewObavestenje(KorisnikProjekat korisnik,Dokument dokument);
    public void creatNewDokumentObavestenje(Set<KorisnikProjekat> korisnici,Dokument dokument);


}
