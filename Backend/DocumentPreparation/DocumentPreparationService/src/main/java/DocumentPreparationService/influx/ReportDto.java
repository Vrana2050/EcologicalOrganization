package DocumentPreparationService.influx;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReportDto {
    Long entityId;
    List<StatusAvg> statuses;
    MaxStatusTime maxStatusTime;
}
