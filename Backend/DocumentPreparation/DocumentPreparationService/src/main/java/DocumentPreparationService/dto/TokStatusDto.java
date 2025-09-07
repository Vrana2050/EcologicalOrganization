package DocumentPreparationService.dto;

import DocumentPreparationService.model.TokStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TokStatusDto {
    private Long id;
    private Long tokId;
    private Long refId;
    private StatusDto trenutnoStanje;
    private TokStatusDto sledeceStanje;
    private TokStatusDto statusNakonOdbijanja;
}
