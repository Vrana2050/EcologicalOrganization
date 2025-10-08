package DocumentPreparationService.model;

import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.InvalidRequestDataException;
import DocumentPreparationService.model.enumeration.Prioritet;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.*;

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

    @Column(name = "rok_zavrsetka")
    private LocalDate rokZavrsetka;

    @Column(name = "poslednja_izmena")
    private LocalDate poslednjaIzmena;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "izmena_od")
    private KorisnikProjekat izmenaOd;

    @Column(name = "procenat_zavrsenosti")
    private Float procenatZavrsenosti;

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

    @Column(name = "datum_kreiranja")
    private LocalDate datumKreiranja;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roditelj_dokument_id")
    private Dokument roditeljDokument;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "glavni_fajl_id")
    private Fajl glavniFajl;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vlasnik")
    private KorisnikProjekat vlasnik;

    @OneToMany(mappedBy = "dokument",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Set<DokumentAktivniFajl> aktivniFajlovi = new java.util.HashSet<>();

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


    @OneToMany(mappedBy = "dokument")
    private Set<DokumentRevizija> revizije = new HashSet<>();

    public Dokument() {
    }

    public void validate() {
        if (this.naziv == null || this.naziv.isEmpty()) throw new InvalidRequestDataException("Name is required");
        validateVlasnik();
        validateZavisiOd();
        List<String> errors = isInDraft();
        boolean isInPripremna_verzija = !errors.isEmpty();
        this.setPripremna_verzija(isInPripremna_verzija);
        this.poslednjaIzmena = LocalDate.now();
    }

    private void validateZavisiOd()
    {
        for(Dokument zavisiOd : this.zavisiOd)
        {
            if(zavisiOd.doesZavisiOd(this.getId()))
            {
                throw new InvalidRequestDataException("Cannot add dependency: circular dependency detected between documents.");
            }
        }
    }
    private void validateVlasnik() {
        if (this.vlasnik == null)
            throw new InvalidRequestDataException("Owner not selected");
        if(roditeljDokument==null)
        {
            if(!projekat.isMenadzer(vlasnik.getKorisnikId())) throw new InvalidRequestDataException("Only managers can create new documents");
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
        if(this.roditeljDokument != null) {
            if(dokument.roditeljDokument != null) {
                return getRoditeljDokument().getId().equals(dokument.getRoditeljDokument().getId());
            }
            return false;
        }
        else if(dokument.getRoditeljDokument() != null)
        {
            return false;
        }
        return  dokument.projekat.getId().equals(this.projekat.getId());
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
        validate();
        if(!updateStatus(newDokument.getStatus())) throw new InvalidRequestDataException("Status not valid");
    }

    public boolean updateStatus(TokStatus newStatus) {
        if(newStatus.getId().equals(status.getId()))
            return true;
        if (pripremna_verzija) {
            if(!newStatus.canVlasnikAdd()) {
                throw new InvalidRequestDataException("Selected status requires non draft version");
            }
            else{
                this.status = newStatus;
                return true;
            }
        }
        if(newStatus.isRevizija())
        {
            if(this.glavniFajl==null)
            {
                throw new ForbiddenException("Selected status requires main file");
            }
            if(!isRevizijaIspravljena())
            {
                throw new ForbiddenException("Current document has uncorrected issues. Cannot change status");
            }
        }
        if (hasActiveDependency()) {
            throw new InvalidRequestDataException("Selected status requires non active dependency");
        }
        if (status.getTrenutnoStanje().getPotrebnoOdobrenjeZaPrelazak()) {
            boolean hasReviewPermission = hasReviewPermission();
            Long novoStanjeId = newStatus.getId();
            if (hasReviewPermission && novoStanjeId.equals(status.getSledeceStanje().getId()) || !hasReviewPermission && novoStanjeId.equals(status.getStatusNakonOdbijanja().getId())) {
                this.status = newStatus;
                return true;
            } else {
                return false;
            }
        } else {
            if (newStatus.getId().equals(status.getSledeceStanje().getId())) {
                this.status = newStatus;
                return true;
            } else {
                return false;
            }
        }
    }

    private boolean isRevizijaIspravljena() {
        if(revizije.isEmpty())
        {
            return true;
        }
        return revizije.stream().allMatch(r-> r.isIspravljena());
    }

    private boolean hasActiveDependency() {
        return zavisiOd.stream().anyMatch(dok -> dok.status.getSledeceStanje() != null);
    }

    private boolean hasReviewPermission() {
        if(revizije.isEmpty()) {
            throw new ForbiddenException("Selected status requires review!");
        }
        return revizije.stream().allMatch(revizija -> revizija.IsResolved());
    }

    public void validateDodeljenik(KorisnikProjekat dodeljeniKorisnik) {
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
        boolean isVlasnik = getVlasnik().getId().equals(korisnikProjekat.getId());
        boolean isDodeljenik =isKorisnikDodeljenik(korisnikProjekat);
        return isVlasnik && getStatus().canVlasnikEdit() || isDodeljenik && getStatus().canDodeljenikEdit();
    }

    public boolean canUpdate(KorisnikProjekat korisnikProjekat){
        return hasEditPermission(korisnikProjekat) && !getPripremna_verzija();
    }

    public boolean isKorisnikVlasnik(KorisnikProjekat korisnikProjekat) {
        return this.vlasnik.getId().equals(korisnikProjekat.getId());
    }

    public boolean canAddSubDocument(KorisnikProjekat korisnikProjekat,Long newStatusId) {
        if(!canUpdate(korisnikProjekat)) return false;
        if(isKorisnikDodeljenik(korisnikProjekat))
        {
            return canDodeljenikAddDocumentInStatus(newStatusId);
        }
        return false;
    }
    private boolean canDodeljenikAddDocumentInStatus(Long statusId) {
        for(TokStatus ts : this.tokIzradeDokumenta.getStatusi()){
            if(ts.getId().equals(statusId)){
                return ts.canAssigneeAddDocument();
            }
        }
        return false;
    }
    private boolean canVlasnikAddDocumentInStatus(Long statusId) {
        for(TokStatus ts : this.tokIzradeDokumenta.getStatusi()){
            if(ts.getId().equals(statusId)){
                return ts.canVlasnikAdd();
            }
        }
        return false;
    }
    public boolean isSubDocument() {
        return this.getRoditeljDokument() != null;
    }

    public boolean canVlasnikEdit() {
        return status.canVlasnikEdit();
    }

    public boolean isInReview() {
        return status.canReview();
    }

    public boolean canDodeljenikEdit() {
        return status.canDodeljenikEdit();
    }

    public boolean canEditFiles() {
        return !isInReview();
    }

    public boolean isRokZavrsetkaAfter(LocalDate rokZavrsetka) {
        return this.getRokZavrsetka().isAfter(rokZavrsetka);
    }

    public boolean doesZavisiOd(Long id) {
        return this.getZavisiOd().stream().anyMatch(dokument -> dokument.getId().equals(id));
    }
}