package DocumentPreparationService.dto;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class StatusCreateLogDto {
    public Instant datum;
    public String dokumentId;
    public String projekatId;
    public Long prethodnoStanjeId;
    public Long novoStanjeId;

    public StatusCreateLogDto(Instant datum, String dokumentId, String projekatId, Long prethodnoStanjeId, Long novoStanjeId) {
        this.datum = datum;
        this.dokumentId = dokumentId;
        this.projekatId = projekatId;
        this.prethodnoStanjeId = prethodnoStanjeId;
        this.novoStanjeId = novoStanjeId;
    }
}
