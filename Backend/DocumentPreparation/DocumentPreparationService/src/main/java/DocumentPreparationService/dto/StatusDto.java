package DocumentPreparationService.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StatusDto {
    private Long id;
    private String naziv;
    private Boolean potrebnoOdobrenjeZaPrelazak;

    private Boolean dozvolaMenjanjaZaVlasnika;

    private Boolean dozvolaDodavanjaZaVlasnika;

    private Boolean dozvolaBrisanjaZaVlasnika;

    private Boolean dozvolaCitanjaZaVlasnika;

    private Boolean dozvolaMenjanjaZaZaduzenog;

    private Boolean dozvolaDodavanjaZaZaduzenog;

    private Boolean dozvolaBrisanjaZaZaduzenog;

    private Boolean dozvolaCitanjaZaZaduzenog;

}
