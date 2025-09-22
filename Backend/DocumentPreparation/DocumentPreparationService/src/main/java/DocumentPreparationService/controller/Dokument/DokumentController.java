package DocumentPreparationService.controller.Dokument;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.TokDto;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.mapper.interfaces.ITokConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.service.interfaces.IDokumentService;
import DocumentPreparationService.service.interfaces.ITokService;
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
    public ResponseEntity<DokumentDto> update(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody Dokument entity) {
        Dokument updatedEntity = dokumentService.update(entity,userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@RequestHeader(name = "X-USER-ID") Long userId,@PathVariable Long id) {
        boolean success = dokumentService.delete(id,userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
    @PatchMapping
    public ResponseEntity<DokumentDto> updateStatus(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody Dokument entity) {
        Dokument updatedEntity = dokumentService.updateStatus(entity,userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
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

}