package DocumentPreparationService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RevizijaIzmenaDto {
    private Long id;
    private Long dokumentRevizijaId;
    private String izmena;
    private Boolean ispravljena;

}
