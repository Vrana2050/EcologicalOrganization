package DocumentPreparationService.dto;

import DocumentPreparationService.model.enumeration.ProjekatStatus;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjekatDto {
    private Long id;
    private String naziv;
    private LocalDate rokZavrsetka;
    private ProjekatStatus status;
    private TokDto tokProjekta;
    private Set<DokumentDto> dokumenti;
    private Set<KorisnikProjekatDto>  korisniciProjekta;
    private Float procenatZavrsenosti;
    private LocalDate datumZavrsetka;
    private LocalDate datumKreiranja;


}
