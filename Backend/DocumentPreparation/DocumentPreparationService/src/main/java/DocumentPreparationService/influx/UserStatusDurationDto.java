package DocumentPreparationService.influx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStatusDurationDto {
    private String izvrsilacId;
    private String dokumentId;
    private Long statusId;
    private Double daysSpent;
}
