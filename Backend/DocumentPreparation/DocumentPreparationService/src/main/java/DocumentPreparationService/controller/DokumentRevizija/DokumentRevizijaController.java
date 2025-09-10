package DocumentPreparationService.controller.DokumentRevizija;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.dto.DokumentRevizijaDto;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.mapper.interfaces.IFajlConverter;
import DocumentPreparationService.mapper.interfaces.IProjekatConverter;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.service.interfaces.IDokumentRevizijaService;
import DocumentPreparationService.service.interfaces.IFajlService;
import DocumentPreparationService.service.interfaces.IProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/review")
@RequireRole(value = "managerOrEmployee")

public class DokumentRevizijaController {
    @Autowired
    private IDokumentRevizijaService dokumentRevizijaService;
    @Autowired
    private IDokumentRevizijaConverter mapper;
    @PostMapping
    public ResponseEntity<Set<DokumentRevizijaDto>> create(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody Set<DokumentRevizijaDto> dto) {
        Set<DokumentRevizija> savedEntity = dokumentRevizijaService.create(mapper.ToEntities(dto),userId);
        return new ResponseEntity<>(mapper.ToDtos(savedEntity), HttpStatus.CREATED);
    }
    @GetMapping("/{dokumentId}")
    public ResponseEntity<Set<DokumentRevizijaDto>> getAllByDokument(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<DokumentRevizija> entities = dokumentRevizijaService.findAllByDokument(dokumentId,userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/byState/{dokumentId}")
    public ResponseEntity<Set<DokumentRevizijaDto>> getAllByDokumentState(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<DokumentRevizija> entities = dokumentRevizijaService.findAllByDokumentState(dokumentId,userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @PutMapping
    public ResponseEntity<Set<DokumentRevizijaDto>> update(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody Set<DokumentRevizijaDto> dto) {
        Set<DokumentRevizija> savedEntity = dokumentRevizijaService.update(mapper.ToEntities(dto),userId);
        return new ResponseEntity<>(mapper.ToDtos(savedEntity), HttpStatus.CREATED);
    }
}