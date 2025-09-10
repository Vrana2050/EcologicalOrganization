package DocumentPreparationService.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "obavestenje")
public class Obavestenje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "poruka")
    private String poruka;

    @Column(name = "korisnik_id")
    private Long korisnikId;

    @Column(name = "procitana")
    private Boolean procitana;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dokument_id")
    private Dokument dokument;

    public Obavestenje() {}

    public boolean markAsRead(Long userId) {
        if(this.korisnikId != userId) return false;
        if(this.procitana == true) return false;
        this.procitana = Boolean.TRUE;
        return true;
    }
}