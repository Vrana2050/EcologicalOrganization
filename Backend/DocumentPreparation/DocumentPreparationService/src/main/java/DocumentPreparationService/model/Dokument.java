package DocumentPreparationService.model;

import DocumentPreparationService.model.enumeration.Prioritet;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.HashSet;
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

    @Column(name = "opis")
    private String opis;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tok_izrade_dokumenta")
    private Tok tokIzradeDokumenta;


    @ManyToOne(fetch = FetchType.LAZY)
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

    @ManyToMany(mappedBy = "zavisiOd",cascade = CascadeType.ALL)
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

    public Dokument() {}

}