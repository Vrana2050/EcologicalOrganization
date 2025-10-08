package DocumentPreparationService.influx;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaxStatusTime {
    Long statusId;
    Double timeSpent;
    public MaxStatusTime(Long statusId, Double timeSpent) {
        this.statusId = statusId;
        this.timeSpent = timeSpent;
    }
}
