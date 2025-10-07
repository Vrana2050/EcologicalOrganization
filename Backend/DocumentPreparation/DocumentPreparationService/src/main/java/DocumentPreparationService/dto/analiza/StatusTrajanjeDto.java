package DocumentPreparationService.dto.analiza;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
@Getter
@Setter
public class StatusTrajanjeDto {
    private Integer stanje;
    private BigDecimal trajanjeDani;
    private String naziv;

}
