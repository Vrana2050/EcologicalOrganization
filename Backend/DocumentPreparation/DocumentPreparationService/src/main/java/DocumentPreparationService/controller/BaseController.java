package DocumentPreparationService.controller;

import DocumentPreparationService.mapper.interfaces.IBaseConverter;
import DocumentPreparationService.service.interfaces.ICrudService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
public class BaseController<Entity,KeyType, Dto> {

    protected final ICrudService<Entity, KeyType> service;
    protected final IBaseConverter<Entity, Dto> mapper;

    public BaseController(ICrudService<Entity, KeyType> service, IBaseConverter<Entity, Dto> mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<Dto> create(@RequestBody Dto dto) {
        Entity savedEntity = service.create(mapper.ToEntity(dto));
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dto> getById(@PathVariable KeyType id) {
        return service.findById(id)
                .map(entity -> ResponseEntity.ok(mapper.ToDto(entity)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping
    public ResponseEntity<Set<Dto>> getAll() {
        Set<Entity> entities = service.findAll();
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }

    @PutMapping
    public ResponseEntity<Dto> update( @RequestBody Dto entity) {
        Entity updatedEntity = service.update(mapper.ToEntity(entity));
        return ResponseEntity.ok(mapper.ToDto(updatedEntity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@PathVariable KeyType id) {
        boolean success = service.delete(id);
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
