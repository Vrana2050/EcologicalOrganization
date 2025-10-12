package DocumentPreparationService.influx;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.DokumentRevizijaDto;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.service.StatusService;
import DocumentPreparationService.service.interfaces.IDokumentRevizijaService;
import jakarta.ws.rs.QueryParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/docPrep/influx")
public class StatusController {
    @Autowired
    private StatusServiceInflux statusService;
    @Autowired
    private SeederService seederService;
    @PostMapping
    public ResponseEntity<StatusLog> create( @RequestBody StatusLog entity) {
        StatusLog savedEntity = statusService.create(entity);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @GetMapping()
    public ResponseEntity<List<StatusLog>> getAll() {
        return ResponseEntity.ok(statusService.getAll());
    }
    @DeleteMapping("/{dokumentId}")
    public ResponseEntity<Boolean> delete( @PathVariable Long dokumentId,@RequestBody DateRangeDto dateRangeDto) {
        return ResponseEntity.ok(statusService.delete(dokumentId,dateRangeDto));
    }
    @PostMapping("/generate")
    public String generate() {
        seederService.seedStatuses(2000);
        return "✅ Uspesno generisano 2000 slogova u InfluxDB (measurement: statuses)";
    }
    @PostMapping("/report")
    public ResponseEntity<ReportDto> getAll(@RequestParam() String projekatId, @RequestBody DateRangeDto dateRangeDto) {
        return ResponseEntity.ok(statusService.getReport(projekatId,dateRangeDto));
    }
    @PostMapping("/user")
    public ResponseEntity<UserChangesDto> getAllByUser(@RequestParam String korisnikId,@RequestParam String projekatId,@RequestBody DateRangeDto dateRangeDto) {
        return ResponseEntity.ok(statusService.getNumberOfStatusChangesByUser(korisnikId,projekatId,dateRangeDto));
    }
    @PostMapping("/user/documents")
    public ResponseEntity<UserDocuments> getAllDocumentsByUser(@RequestParam String korisnikId,@RequestBody DateRangeDto dateRangeDto) {
        return ResponseEntity.ok(statusService.getAllDocumentsByUser(korisnikId,dateRangeDto));
    }
    @PostMapping("/user/status/duration")
    public ResponseEntity<UserStatusDurationDto> getStatusDuration(@RequestParam String korisnikId,@RequestParam Long statusId, @RequestParam String dokumentId,@RequestBody DateRangeDto dateRangeDto) {
        return ResponseEntity.ok(statusService.getStatusDuration(korisnikId,dokumentId,statusId,dateRangeDto));
    }
}
