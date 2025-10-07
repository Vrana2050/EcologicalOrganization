package DocumentPreparationService.controller.Fajl;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.DokumentAktivniFajlDto;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.mapper.interfaces.IDokumentAktivniFajlConverter;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.mapper.interfaces.IFajlConverter;
import DocumentPreparationService.model.DokumentAktivniFajl;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.service.interfaces.IDokumentService;
import DocumentPreparationService.service.interfaces.IFajlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/file")
@RequireRole(value = "managerOrEmployee")

public class FajlController {
    @Autowired
    private IFajlService fajlService;
    @Autowired
    private IFajlConverter mapper;
    @Autowired
    private IDokumentAktivniFajlConverter  aktivniFajlConverter;

    @PostMapping
    public ResponseEntity<FajlDto> uploadFajl(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody FajlDto dto) {
        Fajl savedEntity = fajlService.uploadFajl(dto.getDokumentId(),userId,mapper.ToEntity(dto));
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }
    @PutMapping("/restore/{dokumentAktivniFajlId}")
    public ResponseEntity<FajlDto> restoreFajl(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentAktivniFajlId, @RequestBody FajlDto dto) {
        Fajl savedEntity = fajlService.restoreFajl(userId,mapper.ToEntity(dto),dokumentAktivniFajlId);
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }

    @GetMapping("/active/{dokumentId}")
    public ResponseEntity<Set<DokumentAktivniFajlDto>> getAllActiveByDokument(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long dokumentId) {
        Set<DokumentAktivniFajl> entities = fajlService.findAllActiveByDokument(dokumentId,userId);
        return ResponseEntity.ok(aktivniFajlConverter.ToDtos(entities));
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
    @PostMapping("/upload")
    public ResponseEntity<FajlDto> uploadFile(
            @RequestHeader(name = "X-USER-ID") Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("dokumentId") Long dokumentId,
            @RequestParam("naziv") String naziv,
            @RequestParam("ekstenzija") String ekstenzija
    ) throws IOException {

        FajlDto dto = new FajlDto();
        dto.setDokumentId(dokumentId);
        dto.setNaziv(naziv);
        dto.setEkstenzija(ekstenzija);
        dto.setPodatak(file.getBytes());
        dto.setDatumKreiranja(LocalDateTime.now());

        Fajl savedEntity = fajlService.uploadFajl(dto.getDokumentId(),userId,mapper.ToEntity(dto));
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }

    /*@DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@RequestHeader(name = "X-USER-ID") Long userId,@PathVariable Long id) {
        boolean success = fajlService.delete(id,userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }*/

}