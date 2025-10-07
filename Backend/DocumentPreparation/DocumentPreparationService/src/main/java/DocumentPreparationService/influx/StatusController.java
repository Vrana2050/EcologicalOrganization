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
}
