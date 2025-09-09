package DocumentPreparationService.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tok_status")
public class TokStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tok_id")
    private Tok tok;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trenutno_stanje")
    private Status trenutnoStanje;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sledece_stanje")
    private TokStatus sledeceStanje;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_nakon_odbijanja")
    private TokStatus statusNakonOdbijanja;

    @Transient
    private Long refId;

    public TokStatus(){}
    public void validate() {
        if(tok == null || trenutnoStanje == null) throw new IllegalArgumentException("Invalid workflow");
        if(trenutnoStanje.getPotrebnoOdobrenjeZaPrelazak() && statusNakonOdbijanja == null) throw new IllegalArgumentException("Invalid workflow");
        trenutnoStanje.validate();
    }

    public boolean isDone() {
        if(sledeceStanje==null)
            return true;
        return false;
    }

    public boolean isInReview() {
        if(trenutnoStanje.getPotrebnoOdobrenjeZaPrelazak())
        {
            return true;
        }
        return false;
    }
}