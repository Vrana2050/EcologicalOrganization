package DocumentPreparationService.dto.analiza;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class EntityDto {
    private Long id;
    private String naziv;
    public  EntityDto() {
    }
    public EntityDto(Long id, String naziv) {
        this.id = id;
        this.naziv = naziv;
    }
}
