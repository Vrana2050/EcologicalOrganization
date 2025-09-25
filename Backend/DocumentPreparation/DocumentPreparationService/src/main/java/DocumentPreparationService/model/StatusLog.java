package DocumentPreparationService.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "status_log")
public class StatusLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "datum")
    private LocalDateTime datum;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "izvrsilac")
    private KorisnikProjekat izvrsilac;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dokument")
    private Dokument dokument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projekat_id")
    private Projekat projekat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prethodno_stanje")
    private TokStatus prethodnoStanje;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "novo_stanje")
    private TokStatus novoStanje;

    public StatusLog(){}
}