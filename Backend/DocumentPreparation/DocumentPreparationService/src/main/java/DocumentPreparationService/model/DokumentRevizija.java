package DocumentPreparationService.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "dokument_revizija")
public class DokumentRevizija {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dokument_id")
    private Dokument dokument;

    @Column(name = "odobreno")
    private Boolean odobreno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trenutni_status")
    private TokStatus trenutniStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregledac_id")
    private KorisnikProjekat pregledac;

    @OneToMany(mappedBy = "revizija", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RevizijaIzmena> izmene = new HashSet<>();

    public DokumentRevizija() {}

    public void setIzmene(Set<RevizijaIzmena> izmene) {
        for (RevizijaIzmena izmena : izmene) {
            addIzmena(izmena);
        }
    }
    public void addIzmena(RevizijaIzmena izmena) {
        izmene.add(izmena);
        izmena.setRevizija(this);
    }
}