package DocumentPreparationService.influx;

import java.util.List;

public class UserDocuments {
    public String korisnikId;
    public List<Long> documentIds;

    public int count;
    public UserDocuments(String korisnikId, List<Long> documentIds) {
        this.korisnikId = korisnikId;
        this.documentIds = documentIds;
        this.count = documentIds != null ? documentIds.size() : 0;    }

}
