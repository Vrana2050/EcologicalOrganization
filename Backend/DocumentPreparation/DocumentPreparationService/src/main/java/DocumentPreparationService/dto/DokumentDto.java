package DocumentPreparationService.dto;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.model.enumeration.Prioritet;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DokumentDto {

    private Long id;

    private ProjekatDto projekat;
    private String naziv;
    private String opis;

    private TokDto tokIzradeDokumenta;
    private TokStatusDto status;

    private Prioritet prioritet;

    private DokumentDto roditeljDokument;
    private FajlDto glavniFajl;
    private KorisnikProjekatDto vlasnik;

    private Set<FajlDto> aktivniFajlovi;
    private Set<FajlDto> sviFajlovi;

    private Set<DokumentDto> zavisiOd;
    private Set<DokumentDto> zavisnici;

    private Set<KorisnikProjekatDto> dodeljeniKorisnici;
    private Set<DokumentRevizijaDto> revizije;
}
