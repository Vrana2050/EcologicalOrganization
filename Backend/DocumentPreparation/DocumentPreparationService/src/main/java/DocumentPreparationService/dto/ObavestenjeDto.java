package DocumentPreparationService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ObavestenjeDto {
    private Long id;
    private String poruka;
    private Long korisnikId;
    private Boolean procitana;
    private DokumentDto dokument;
}
