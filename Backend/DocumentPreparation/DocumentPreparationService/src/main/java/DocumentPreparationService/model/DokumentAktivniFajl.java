package DocumentPreparationService.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "dokument_aktivni_fajl")
public class DokumentAktivniFajl {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dokument_id", nullable = false)
    private Dokument dokument;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fajl_id", nullable = false)
    private Fajl fajl;
}
