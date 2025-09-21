package DocumentPreparationService.model;

import DocumentPreparationService.exception.InvalidRequestDataException;
import DocumentPreparationService.model.enumeration.ProjekatStatus;
import DocumentPreparationService.model.enumeration.Uloga;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "projekat")
public class Projekat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "naziv", nullable = false)
    private String naziv;

    @Nationalized
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProjekatStatus status;

    @Column(name = "rok_zavrsetka", nullable = false)
    private LocalDate rokZavrsetka;
    @Column(name = "procenat_zavrsenosti")
    private Float procenatZavrsenosti;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tok_projekta_id")
    private Tok tokProjekta;

    @OneToMany(mappedBy = "projekat", fetch = FetchType.LAZY,cascade = CascadeType.ALL,orphanRemoval = true)
    private Set<KorisnikProjekat> korisniciProjekta = new HashSet<>();

    @OneToMany(mappedBy = "projekat", fetch = FetchType.LAZY)
    private Set<Dokument> dokumenti = new HashSet<>();

    public void setKorisniciProjekta(Set<KorisnikProjekat> korisniciProjekta) {
        this.korisniciProjekta.clear();
        for(KorisnikProjekat kp : korisniciProjekta) {
            this.korisniciProjekta.add(kp);
            kp.setProjekat(this);
        }
    }

    public  Projekat() {}
    public void validate()
    {
        if(this.getTokProjekta() ==null || this.getTokProjekta().getId() == null) throw new InvalidRequestDataException("Invalid workflow");
        if(this.status == null) throw new InvalidRequestDataException("Invalid status");
        if(this.naziv == null) throw new InvalidRequestDataException("Invalid name");
        if(this.rokZavrsetka == null || this.rokZavrsetka.isBefore(LocalDate.now())) throw new InvalidRequestDataException("Invalid project due date");
        if(this.getKorisniciProjekta().isEmpty()) throw new InvalidRequestDataException("Project assignees cannot be empty");

    }
    public void update(Projekat projekat) {
        this.naziv = projekat.getNaziv();
        this.status = projekat.getStatus();
        this.rokZavrsetka = projekat.getRokZavrsetka();
        if(!projekat.getKorisniciProjekta().isEmpty()) {
            setKorisniciProjekta(projekat.getKorisniciProjekta());
        }
        validate();
    }
    public boolean isMenadzer(Long userId){
        for(KorisnikProjekat kp : this.korisniciProjekta){
            if(kp.getKorisnikId().equals(userId)){
                if(kp.getUlogaUProjektu() == Uloga.menadzer)
                {
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    public boolean isOnProject(Long userId) {
        for(KorisnikProjekat kp : this.korisniciProjekta){
            if(kp.getKorisnikId().equals(userId)){
                return true;
            }
        }
        return false;
    }

    public boolean isInProgress() {
        return status.equals(ProjekatStatus.u_toku);
    }
}