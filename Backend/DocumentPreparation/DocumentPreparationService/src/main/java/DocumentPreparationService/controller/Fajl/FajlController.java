package DocumentPreparationService.controller.Fajl;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.mapper.interfaces.IFajlConverter;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.service.interfaces.IDokumentService;
import DocumentPreparationService.service.interfaces.IFajlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/file")
@RequireRole(value = "managerOrEmployee")

public class FajlController {
    @Autowired
    private IFajlService fajlService;
    @Autowired
    private IFajlConverter mapper;

    @PostMapping
    public ResponseEntity<FajlDto> uploadFajl(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody FajlDto dto) {
        Fajl savedEntity = fajlService.uploadFajl(dto.getDokumentId(),userId,mapper.ToEntity(dto));
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }

    @GetMapping("/active/{dokumentId}")
    public ResponseEntity<Set<FajlDto>> getAllActiveByDokument(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<Fajl> entities = fajlService.findAllActiveByDokument(dokumentId,userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }

    @GetMapping("/all/{dokumentId}")
    public ResponseEntity<Set<FajlDto>> getAllByDokument(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<Fajl> entities = fajlService.findAllByDokument(dokumentId,userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/all/review/{dokumentId}")
    public ResponseEntity<Set<FajlDto>> getAllFilesForReview(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<Fajl> entities = fajlService.findAllByDokumentForRevizija(dokumentId,userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/versions/{aktivni_fajl_id}")
    public ResponseEntity<Set<FajlDto>> getAllFileVersions(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long aktivni_fajl_id,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size){
        Set<Fajl> entities = fajlService.findAllFileVersions(aktivni_fajl_id,userId,page,size);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }

    /*@DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@RequestHeader(name = "X-USER-ID") Long userId,@PathVariable Long id) {
        boolean success = fajlService.delete(id,userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }*/

}