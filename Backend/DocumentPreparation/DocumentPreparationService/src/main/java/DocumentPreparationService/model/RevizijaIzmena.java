package DocumentPreparationService.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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

    public RevizijaIzmena() {}
}