package DocumentPreparationService.influx;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusAvg {
    public Long statusId;
    public Double avgTime;
    public StatusAvg(Long statusId, Double avgTime) {
        this.statusId = statusId;
        this.avgTime = avgTime;
    }
}
