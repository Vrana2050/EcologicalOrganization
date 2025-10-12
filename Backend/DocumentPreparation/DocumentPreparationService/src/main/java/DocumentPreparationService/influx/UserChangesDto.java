package DocumentPreparationService.influx;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserChangesDto {
    public String userId;
    public String projekatId;
    public int numberOfStatusChanges;
    public String mostChangedDocumentId;
    public UserChangesDto(String userId,String projekatId,int numberOfStatusChanges,String mostChangedDocumentId) {
        this.userId = userId;
        this.projekatId = projekatId;
        this.mostChangedDocumentId = mostChangedDocumentId;
        this.numberOfStatusChanges = numberOfStatusChanges;
    }

}
