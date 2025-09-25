package DocumentPreparationService.model;

import DocumentPreparationService.model.enumeration.Uloga;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "korisnik_projekat")
public class KorisnikProjekat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "korisnik_id")
    private Long korisnikId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projekat_id")
    private Projekat projekat;

    @Nationalized
    @Enumerated(EnumType.STRING)
    @Column(name = "uloga_u_projektu", nullable = false)
    private Uloga ulogaUProjektu;
    @ManyToMany
    @JoinTable(
            name = "korisnik_dokument",
            joinColumns = @JoinColumn(name = "korisnik_id"),
            inverseJoinColumns = @JoinColumn(name = "dokument_id")
    )
    private Set<Dokument> dokumenti = new HashSet<>();

    public KorisnikProjekat(Long korisnikId) {
        this.korisnikId = korisnikId;
    }
    public KorisnikProjekat(Long korisnikId,Projekat projekat,Uloga ulogaUProjektu) {
        this.korisnikId = korisnikId;
        this.projekat = projekat;
        this.ulogaUProjektu = ulogaUProjektu;
    }

    public KorisnikProjekat() {

    }

    public boolean isLowerRanked(KorisnikProjekat korisnikProjekat) {
        return this.ulogaUProjektu.ordinal() > korisnikProjekat.getUlogaUProjektu().ordinal();
    }
}