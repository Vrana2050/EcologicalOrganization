package DocumentPreparationService.dto;

import DocumentPreparationService.model.RevizijaIzmena;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DokumentRevizijaDto {
    private Long id;
    private DokumentDto dokument;
    private Boolean odobreno;
    private TokStatusDto trenutniStatus;
    private KorisnikProjekatDto pregledac;
    private Set<RevizijaIzmenaDto> izmene;


}
