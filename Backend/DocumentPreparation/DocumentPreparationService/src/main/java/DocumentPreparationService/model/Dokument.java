package DocumentPreparationService.model;

import DocumentPreparationService.exception.InvalidRequestDataException;
import DocumentPreparationService.model.enumeration.Prioritet;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "dokument")
public class Dokument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projekat_id")
    private Projekat projekat;

    @Column(name = "naziv")
    private String naziv;

    @Column(name = "pripremna_verzija")
    private Boolean pripremna_verzija;

    @Column(name = "opis")
    private String opis;

    @Column(name = "rok_zavrsetka", nullable = false)
    private LocalDate rokZavrsetka;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tok_izrade_dokumenta")
    private Tok tokIzradeDokumenta;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status")
    private TokStatus status;

    @Nationalized
    @Enumerated(EnumType.STRING)
    @Column(name = "prioritet", nullable = false)
    private Prioritet prioritet;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roditelj_dokument_id")
    private Dokument roditeljDokument;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "glavni_fajl_id")
    private Fajl glavniFajl;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vlasnik")
    private KorisnikProjekat vlasnik;

    @ManyToMany
    @JoinTable(
            name = "dokument_aktivni_fajl",
            joinColumns = @JoinColumn(name = "dokument_id"),
            inverseJoinColumns = @JoinColumn(name = "fajl_id")
    )
    private Set<Fajl> aktivniFajlovi = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "dokument_fajl",
            joinColumns = @JoinColumn(name = "dokument_id"),
            inverseJoinColumns = @JoinColumn(name = "fajl_id")
    )
    private Set<Fajl> sviFajlovi = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "dokument_zavisnost",
            joinColumns = @JoinColumn(name = "dokument_id"),
            inverseJoinColumns = @JoinColumn(name = "zavisi_od")
    )
    private Set<Dokument> zavisiOd = new HashSet<>();

    @ManyToMany(mappedBy = "zavisiOd", cascade = CascadeType.ALL)
    private Set<Dokument> zavisnici = new HashSet<>();
    @ManyToMany
    @JoinTable(
            name = "korisnik_dokument",
            joinColumns = @JoinColumn(name = "dokument_id"),
            inverseJoinColumns = @JoinColumn(name = "korisnik_id")
    )
    private Set<KorisnikProjekat> dodeljeniKorisnici = new HashSet<>();


    @OneToMany(mappedBy = "dokument", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DokumentRevizija> revizije = new HashSet<>();

    public Dokument() {
    }

    public void validate() {
        if (this.naziv == null || this.naziv.isEmpty()) throw new InvalidRequestDataException("Name is required");
        validateVlasnik();
        List<String> errors = isInDraft();
        boolean isInPripremna_verzija = !errors.isEmpty();
        if (pripremna_verzija != null && !pripremna_verzija && isInPripremna_verzija)
            throw new InvalidRequestDataException(errors.toString());
        this.setPripremna_verzija(isInPripremna_verzija);
    }

    private void validateVlasnik() {
        if (this.vlasnik == null)
            throw new InvalidRequestDataException("Owner not selected");
        if(roditeljDokument==null)
        {
            if(!projekat.isMenadzer(vlasnik.getId())) throw new InvalidRequestDataException("Only managers can create new documents");
        }
        else{
            if(!roditeljDokument.isKorisnikDodeljenik(vlasnik)) throw new InvalidRequestDataException("Only assignees on parent document can create subdocument");
        }
    }

    public List<String> isInDraft() {
        List<String> errors = new ArrayList<>();

        if (this.opis == null || this.opis.isEmpty())
            errors.add("Description is required");
        if (this.naziv == null || this.naziv.isEmpty())
            errors.add("Name is required");
        if (this.projekat == null)
            errors.add("Project not selected");
        if (this.prioritet == null)
            errors.add("Priority not selected");
        if (this.rokZavrsetka == null || this.rokZavrsetka.isBefore(LocalDate.now())
                || this.rokZavrsetka.isAfter(this.projekat.getRokZavrsetka()))
            errors.add("Invalid due date");
        if (this.getDodeljeniKorisnici().isEmpty())
            errors.add("Document assignees cannot be empty");

        if (this.zavisiOd != null) {
            for (Dokument dokument : this.zavisiOd) {
                if (!HasSameParent(dokument))
                    errors.add("Invalid dependency: parent documents must match.");
                if (dokument.getRokZavrsetka().isAfter(this.rokZavrsetka))
                    errors.add("Invalid dependency: cannot depend on document with longer due date.");
            }
        }
        if (this.dodeljeniKorisnici != null) {
            for (KorisnikProjekat korisnikProjekat : getDodeljeniKorisnici()) {
                validateDodeljenik(korisnikProjekat);
            }
        }

        return errors;
    }

    public boolean HasSameParent(Dokument dokument) {
        return (dokument.roditeljDokument.equals(this.roditeljDokument) && dokument.projekat.equals(this.projekat));
    }

    public boolean statusExistsInWorkflow() {
        if (this.getRoditeljDokument() != null) {
            return getRoditeljDokument().getTokIzradeDokumenta().getStatusi().contains(this.getStatus());
        }
        return projekat.getTokProjekta().getStatusi().contains(this.getStatus());
    }

    public void update(Dokument newDokument) {
        this.naziv = newDokument.getNaziv();
        this.rokZavrsetka = newDokument.getRokZavrsetka();
        this.opis = newDokument.getOpis();
        this.prioritet = newDokument.getPrioritet();
        this.vlasnik = newDokument.getVlasnik();
        if(!updateStatus(newDokument.getStatus())) throw new InvalidRequestDataException("Status not valid");
        validate();
    }

    public boolean updateStatus(TokStatus newStatus) {
        if(newStatus == status)
            return true;
        if (pripremna_verzija) {
            return false;
        }
        if (hasActiveDependency()) {
            return false;
        }
        if (status.getTrenutnoStanje().getPotrebnoOdobrenjeZaPrelazak()) {
            boolean hasReviewPermission = hasReviewPermission();
            Long novoStanjeId = newStatus.getTrenutnoStanje().getId();
            if (hasReviewPermission && novoStanjeId.equals(status.getSledeceStanje().getId()) || !hasReviewPermission && novoStanjeId.equals(status.getStatusNakonOdbijanja().getId())) {
                this.status = newStatus;
                return true;
            } else {
                return false;
            }
        } else {
            if (newStatus.getTrenutnoStanje().getId().equals(status.getSledeceStanje().getId())) {
                this.status = newStatus;
                return true;
            } else {
                return false;
            }
        }
    }

    private boolean hasActiveDependency() {
        return zavisiOd.stream().anyMatch(dok -> dok.status.getSledeceStanje() != null);
    }

    private boolean hasReviewPermission() {
        return revizije.stream().anyMatch(revizija -> revizija.getOdobreno() && revizija.getTrenutniStatus().getId().equals(status.getTrenutnoStanje().getId()));
    }

    public void validateDodeljenik(KorisnikProjekat dodeljeniKorisnik) {
        System.out.print(dodeljeniKorisnik.getUlogaUProjektu());
        if(vlasnik.isLowerRanked(dodeljeniKorisnik))
        {
            throw new InvalidRequestDataException("Cannot assign people with higher rank");
        }
        if(!dodeljeniKorisnik.getProjekat().getId().equals(projekat.getId())){
            throw new InvalidRequestDataException("Assignee is not on the same project");
        }
    }
    public boolean isKorisnikDodeljenik(KorisnikProjekat dodeljeniKorisnik) {
        return dodeljeniKorisnici.stream().anyMatch(dok -> dok.getId().equals(dodeljeniKorisnik.getId()));
    }

    public boolean hasEditPermission(KorisnikProjekat korisnikProjekat) {
        boolean isVlasnik = getVlasnik().getId() == korisnikProjekat.getId();
        boolean isDodeljenik =isKorisnikDodeljenik(korisnikProjekat);
        return isVlasnik && getStatus().getTrenutnoStanje().getDozvolaMenjanjaZaVlasnika() || isDodeljenik && getStatus().getTrenutnoStanje().getDozvolaMenjanjaZaZaduzenog() != null;
    }

    public boolean canUpdate(KorisnikProjekat korisnikProjekat){
        return hasEditPermission(korisnikProjekat) && !getPripremna_verzija();
    }

    public boolean isKorisnikVlasnik(KorisnikProjekat korisnikProjekat) {
        return this.vlasnik.getId().equals(korisnikProjekat.getId());
    }
}