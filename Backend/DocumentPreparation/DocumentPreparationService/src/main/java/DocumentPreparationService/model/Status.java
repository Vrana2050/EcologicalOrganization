package DocumentPreparationService.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "status")
public class Status {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "naziv")
    private String naziv;

    @Column(name = "potrebno_odobrenje_za_prelazak")
    private Boolean potrebnoOdobrenjeZaPrelazak;

    @Column(name = "dozvola_menjanja_za_vlasnika")
    private Boolean dozvolaMenjanjaZaVlasnika;

    @Column(name = "dozvola_dodavanja_za_vlasnika")
    private Boolean dozvolaDodavanjaZaVlasnika;

    @Column(name = "dozvola_brisanja_za_vlasnika")
    private Boolean dozvolaBrisanjaZaVlasnika;

    @Column(name = "dozvola_citanja_za_vlasnika")
    private Boolean dozvolaCitanjaZaVlasnika;

    @Column(name = "dozvola_menjanja_za_zaduzenog")
    private Boolean dozvolaMenjanjaZaZaduzenog;

    @Column(name = "dozvola_dodavanja_za_zaduzenog")
    private Boolean dozvolaDodavanjaZaZaduzenog;

    @Column(name = "dozvola_brisanja_za_zaduzenog")
    private Boolean dozvolaBrisanjaZaZaduzenog;

    @Column(name = "dozvola_citanja_za_zaduzenog")
    private Boolean dozvolaCitanjaZaZaduzenog;

    public Status(){}
    public void validate(){
        if(naziv==null || naziv.isEmpty()) throw new IllegalArgumentException("Name is required.");
    }

}