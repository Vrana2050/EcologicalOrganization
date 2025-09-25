package DocumentPreparationService.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "statistika_projektnih_dokumenata")
public class StatistikaProjektnihDokumenata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "statistika_projekta_id")
    private StatistikaProjekta statistikaProjekta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dokument_id")
    private Dokument dokument;

    @Column(name = "prekoracenje_roka_u_procentima")
    private Double prekoracenjeRokaUProcentima;

    public StatistikaProjektnihDokumenata() {}
}