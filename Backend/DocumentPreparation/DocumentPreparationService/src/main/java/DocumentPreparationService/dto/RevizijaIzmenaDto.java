package DocumentPreparationService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RevizijaIzmenaDto {
    private Long id;
    private Long dokumentRevizijaId;
    private String izmena;
    private Boolean ispravljena;
    private LocalDate datumIspravljanja;
    private Long fajlId;
    private Boolean ispravkaOdobrena;
    private Long aktivniFajlId;
}
