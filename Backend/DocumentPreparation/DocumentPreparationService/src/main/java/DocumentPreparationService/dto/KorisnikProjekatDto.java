package DocumentPreparationService.dto;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.enumeration.Uloga;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class KorisnikProjekatDto {
    private Long id;
    private Long korisnikId;
    private Long projekatId;
    private Uloga ulogaUProjektu;
    private Set<DokumentDto> dokumenti;


}
