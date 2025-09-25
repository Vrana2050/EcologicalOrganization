package DocumentPreparationService.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "statistika_projekta")
public class StatistikaProjekta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projekat_id")
    private Projekat projekat;

    @Column(name = "broj_neispostovanih_rokova")
    private Long brojNeispostovanihRokova;

    @Column(name = "broj_zatrazenih_ispravki")
    private Long brojZatrazenihIspravki;

    @Column(name = "procenat_ispostovanosti_zadatog_roka")
    private Double procenatIspostovanostiZadatogRoka;

    public StatistikaProjekta() {}
}