package DocumentPreparationService.controller.Dokument;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.analiza.AnalizaDto;
import DocumentPreparationService.dto.analiza.DokumentAnaliza;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.service.interfaces.IDokumentService;
import DocumentPreparationService.service.interfaces.IStatistikaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/document")
@RequireRole(value = "managerOrEmployee")

public class DokumentController  {
    @Autowired
    private IDokumentService dokumentService;
    @Autowired
    private IDokumentConverter mapper;
    @Autowired
    private IStatistikaService  statistikaService;

    @PostMapping
    public ResponseEntity<DokumentDto> create(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody DokumentDto dto) {
        Dokument savedEntity = dokumentService.create(mapper.ToEntity(dto),userId);
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DokumentDto> getById(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(mapper.ToDto(dokumentService.findById(id,userId)));
    }

    @GetMapping
    public ResponseEntity<Set<DokumentDto>> getAll(@RequestHeader(name = "X-USER-ID") Long userId) {
        Set<Dokument> entities = dokumentService.findAll(userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }

    @PutMapping
    public ResponseEntity<DokumentDto> update(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody DokumentDto entityDto) {
        Dokument updatedEntity = dokumentService.update(mapper.ToEntity(entityDto),userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }
    @PatchMapping("/workflow")
    public ResponseEntity<DokumentDto> updateDokumentWorkflow(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody DokumentDto entityDto) {
        Dokument updatedEntity = dokumentService.updateWorkflow(mapper.ToEntity(entityDto),userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@RequestHeader(name = "X-USER-ID") Long userId,@PathVariable Long id) {
        boolean success = dokumentService.delete(id,userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
    @PatchMapping("/status")
    public ResponseEntity<DokumentDto> updateStatus(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody DokumentDto entityDto) {
        Dokument updatedEntity = dokumentService.updateStatus(mapper.ToEntity(entityDto),userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }
    @PatchMapping("/mainFile")
    public ResponseEntity<DokumentDto> updateMainFile(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody DokumentDto entityDto) {
        Dokument updatedEntity = dokumentService.updateMainFile(mapper.ToEntity(entityDto),userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }
    @PatchMapping("/dependencies")
    public ResponseEntity<DokumentDto> updateDependencies(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody DokumentDto entityDto) {
        Dokument updatedEntity = dokumentService.updateDependencies(mapper.ToEntity(entityDto),userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }
    @GetMapping("/{dokumentId}/parentDocuments")
    public ResponseEntity<Set<DokumentDto>> getAllParentDocuments(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<Dokument> entities = dokumentService.findAllParentDocuments(userId,dokumentId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/board/project/{projekatId}")
    public ResponseEntity<Set<DokumentDto>> getBoardDocumentsByProjectId(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long projekatId) {
        Set<Dokument> entities = dokumentService.findAllBoardDocumentsByProjectId(userId,projekatId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/board/document/{roditeljDokumentId}")
    public ResponseEntity<Set<DokumentDto>> getBoardDocumentsByParentDocumentId(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long roditeljDokumentId) {
        Set<Dokument> entities = dokumentService.findAllBoardDocumentsByParentDocumentId(userId,roditeljDokumentId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/analysis/{dokumentId}")
    public ResponseEntity<AnalizaDto> getDocumentReport(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        return ResponseEntity.ok(statistikaService.getDokumentAnalysis(userId,dokumentId));
    }
    @GetMapping("/project/{projekatId}")
    public ResponseEntity<Set<DokumentDto>> getAllDocumentsOnProject(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long projekatId) {
        Set<Dokument> entities = dokumentService.getAllDocumentsOnProject(userId,projekatId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/parentDocument/{dokumentId}")
    public ResponseEntity<Set<DokumentDto>> getAllDocumentsOnParentDocument(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<Dokument> entities = dokumentService.getAllDocumentsOnParentDocument(userId,dokumentId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }


}