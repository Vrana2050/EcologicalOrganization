package DocumentPreparationService.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TokDto {
    private Long id;
    private String naziv;
    private Set<TokStatusDto> statusi;
}
