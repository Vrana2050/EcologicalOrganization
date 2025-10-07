package DocumentPreparationService.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DokumentAktivniFajlDto {
    public Long id;
    public Long dokumentId;
    public FajlDto fajl;
}
