package DocumentPreparationService.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import javax.swing.text.Document;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "fajl")
public class Fajl {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "podatak")
    private byte[] podatak;

    @Column(name = "verzija")
    private Long verzija;

    @Column(name = "datum_kreiranja")
    private LocalDateTime datumKreiranja;

    @Column(name = "naziv")
    private String naziv;

    @Column(name = "ekstenzija", length = 15)
    private String ekstenzija;

    @ManyToMany(mappedBy = "sviFajlovi")
    private Set<Dokument> dokumenti = new HashSet<>();
    public Fajl(){}
}