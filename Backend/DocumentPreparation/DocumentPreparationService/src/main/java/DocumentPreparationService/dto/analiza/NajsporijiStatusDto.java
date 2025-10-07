package DocumentPreparationService.dto.analiza;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class NajsporijiStatusDto {
        private Integer statusId;
        private String naziv;
        private BigDecimal prosecnoVremeZadrzavanja;
}