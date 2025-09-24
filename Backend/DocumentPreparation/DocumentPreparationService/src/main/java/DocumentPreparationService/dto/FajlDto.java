package DocumentPreparationService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;


@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FajlDto {
    private Long id;
    private Long dokumentId;
    private byte[] podatak;
    private Long verzija;
    private LocalDateTime datumKreiranja;
    private String naziv;
    private String ekstenzija;

    public FajlDto(Long id, String naziv, Long verzija, LocalDateTime datumKreiranja, String ekstenzija, byte[] bytes) {
        this.id = id;
        this.naziv = naziv;
        this.verzija = verzija;
        this.datumKreiranja = datumKreiranja;
        this.ekstenzija = ekstenzija;
        this.podatak = bytes;

    }
    public FajlDto() {}
}
