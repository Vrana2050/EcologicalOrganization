package DocumentPreparationService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TokStatusDto {
    private Long id;
    private TokDto tok;
    private StatusDto trenutnoStanje;
    private StatusDto sledeceStanje;
    private StatusDto prethodnoStanje;
    private StatusDto statusNakonOdbijanja;
}
