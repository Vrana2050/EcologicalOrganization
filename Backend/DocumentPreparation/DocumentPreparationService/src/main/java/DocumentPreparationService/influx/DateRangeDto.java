package DocumentPreparationService.influx;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class DateRangeDto {
    OffsetDateTime start;
    OffsetDateTime end;
}
