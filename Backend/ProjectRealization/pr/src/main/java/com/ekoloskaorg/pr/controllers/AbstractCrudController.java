package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.services.AbstractCrudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


public abstract class AbstractCrudController<D, ID> {

    protected final AbstractCrudService<?, ID, D> service;

    protected AbstractCrudController(AbstractCrudService<?, ID, D> service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<D>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }


    @GetMapping("/{id}")
    public ResponseEntity<D> get(@PathVariable ID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping
    public ResponseEntity<D> create(@RequestBody @Valid D dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<D> update(@PathVariable ID id,
                                    @RequestBody @Valid D dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}