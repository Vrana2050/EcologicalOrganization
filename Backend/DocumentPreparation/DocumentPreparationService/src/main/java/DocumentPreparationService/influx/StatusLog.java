package DocumentPreparationService.influx;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.model.TokStatus;
import com.influxdb.annotations.Column;
import com.influxdb.annotations.Measurement;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Measurement(name="statuses")
public class StatusLog {

    @Column(timestamp = true)
    private Instant datum;
    @Column(tag = true)
    private String dokumentId;
    @Column(tag = true)
    private String projekatId;
    @Column
    private Long prethodnoStanjeId;
    @Column
    private Long novoStanjeId;

    public StatusLog(Instant datum,String dokumentId,String projekatId,Long prethodnoStanjeId,Long novoStanjeId) {
        this.dokumentId = dokumentId;
        this.projekatId = projekatId;
        this.prethodnoStanjeId = prethodnoStanjeId;
        this.novoStanjeId = novoStanjeId;
        this.datum = datum;
    }
    public StatusLog() {}
}
