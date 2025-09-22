package DocumentPreparationService.controller.Projekat;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.ProjekatDto;
import DocumentPreparationService.mapper.interfaces.IProjekatConverter;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.service.interfaces.IProjekatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/manager/project")
@RequireRole(value = "manager")
public class ManagerProjekatController {
    @Autowired
    private IProjekatService projekatService;
    @Autowired
    private IProjekatConverter mapper;
    @PostMapping
    public ResponseEntity<ProjekatDto> create(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody ProjekatDto dto) {
        Projekat savedEntity = projekatService.create(mapper.ToEntity(dto),userId);
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }

    /*@GetMapping("/{id}")
    public ResponseEntity<ProjekatDto> getById(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long id) {
        return projekatService.findById(id,userId)
                .map(entity -> ResponseEntity.ok(mapper.ToDto(entity)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping
    public ResponseEntity<Set<ProjekatDto>> getAll(@RequestHeader(name = "X-USER-ID") Long userId) {
        Set<Projekat> entities = projekatService.findAll(userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }*/

    @PutMapping
    public ResponseEntity<ProjekatDto> update(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody Projekat entity) {
        Projekat updatedEntity = projekatService.update(entity,userId);
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@RequestHeader(name = "X-USER-ID") Long userId,@PathVariable Long id) {
        boolean success = projekatService.delete(id,userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
