package DocumentPreparationService.controller.Tok;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.controller.BaseController;
import DocumentPreparationService.dto.TokDto;
import DocumentPreparationService.mapper.interfaces.ITokConverter;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.service.interfaces.ITokService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/workflow")
@RequireRole(value = "managerOrEmployee")

public class TokController  {
    @Autowired
    private ITokService tokService;
    @Autowired
    private ITokConverter mapper;
    @PostMapping
    public ResponseEntity<TokDto> create(@RequestBody TokDto dto) {
        Tok savedEntity = tokService.create(mapper.ToEntity(dto));
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TokDto> getById(@PathVariable Long id) {
        return tokService.findById(id)
                .map(entity -> ResponseEntity.ok(mapper.ToDto(entity)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping
    public ResponseEntity<Set<TokDto>> getAll() {
        Set<Tok> entities = tokService.findAll();
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }

}
