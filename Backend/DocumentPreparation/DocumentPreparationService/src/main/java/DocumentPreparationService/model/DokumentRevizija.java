package DocumentPreparationService.model;

import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.InvalidRequestDataException;
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

    @OneToMany(mappedBy = "revizija", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    private Set<RevizijaIzmena> izmene = new HashSet<>();
    public void setIzmene(Set<RevizijaIzmena> izmene){
        this.izmene.clear();
        for(RevizijaIzmena revizijaIzmena : izmene){
            revizijaIzmena.setRevizija(this);
            revizijaIzmena.validate();
            this.izmene.add(revizijaIzmena);
        }
    }

    public DokumentRevizija() {}
    public void validate(){
        if(dokument==null) throw new InvalidRequestDataException("Dokument is required");
        if(!trenutniStatus.getTrenutnoStanje().getPotrebnoOdobrenjeZaPrelazak()) throw new InvalidRequestDataException("Cannot review in current state");
        validatePregledac();
        setOdobreno(getIzmene().isEmpty());
    }
    private void validatePregledac() {
        if(pregledac==null) throw new InvalidRequestDataException("Reviewer is required");
        if(!dokument.isKorisnikVlasnik(pregledac)) throw  new ForbiddenException("Reviewer is not document owner");
    }

    public void update(DokumentRevizija newDokumentRevizija) {
        for(RevizijaIzmena revizijaIzmena : newDokumentRevizija.getIzmene()) {
            izmene.forEach(izmena->{if(izmena.getId()==revizijaIzmena.getId()) izmena.update(izmena);});
        }
    }
}