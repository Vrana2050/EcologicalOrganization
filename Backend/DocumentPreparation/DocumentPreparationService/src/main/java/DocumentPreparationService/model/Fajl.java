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

    public boolean isNewVerzija(Fajl newFajl) {
        return this.naziv.equals(newFajl.getNaziv()) && this.ekstenzija.equals(newFajl.getEkstenzija());
    }

    public void validate() {
        if(podatak == null) throw new IllegalArgumentException("Data missing");
        if(verzija == null)
        {
            this.verzija= Long.valueOf(1);
        }
        if(datumKreiranja == null)  throw new IllegalArgumentException("Date missing");
        if(naziv == null || naziv.isEmpty())  throw new IllegalArgumentException("Invalid file name");
        validateEkstenzija();
    }

    private void validateEkstenzija() {
        if(ekstenzija == null || ekstenzija.isEmpty()) throw new IllegalArgumentException("Invalid file extension");
        Set<String> allowedExtensions = Set.of(
                "txt",
                "doc", "docx",
                "jpg", "jpeg", "png", "gif", "bmp"
        );
        String lowerExt = ekstenzija.toLowerCase();

        if (!allowedExtensions.contains(lowerExt)) {
            throw new IllegalArgumentException("File extension not allowed: " + ekstenzija);
        }
    }

    public void updateVerzija(Set<Fajl> sviFajlovi) {
        this.verzija = (long) sviFajlovi.size() + 1;
    }
}