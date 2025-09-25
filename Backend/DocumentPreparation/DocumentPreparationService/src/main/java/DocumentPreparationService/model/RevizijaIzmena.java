package DocumentPreparationService.model;

import DocumentPreparationService.exception.InvalidRequestDataException;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "revizija_izmena")
public class RevizijaIzmena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revizija_id")
    private DokumentRevizija revizija;

    @Column(name = "izmena")
    private String izmena;

    @Column(name = "ispravljena")
    private Boolean ispravljena;

    @Column(name = "datum_ispravljanja", nullable = false)
    private LocalDate datumIspravljanja;

    public RevizijaIzmena() {}
    public void validate(){
        if(this.izmena == null) throw new InvalidRequestDataException("Change is required");
        if(this.ispravljena == null)
        {
            setIspravljena(false);
        }
        if(this.revizija == null) throw new InvalidRequestDataException("Review is required");
    }

    public void update(RevizijaIzmena izmena) {
        this.ispravljena = izmena.getIspravljena();
        if(izmena.getIspravljena()) {
            this.setDatumIspravljanja(izmena.getDatumIspravljanja());
        }
    }
}