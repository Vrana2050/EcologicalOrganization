package DocumentPreparationService.dto.analiza;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class DokumentAnaliza {
    private EntityDto dokument;
    private BigDecimal procenatRoka;
    private Integer brojVracanja;
    private List<EntityDto> zavisniDokumenti;
    private List<StatusTrajanjeDto> trajanjePoStanjima;
}
