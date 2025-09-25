package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.mappers.BaseMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public abstract class AbstractCrudService<E, ID, D> {

    protected abstract JpaRepository<E, ID> repo();
    protected abstract BaseMapper<E, D> mapper();

    protected void beforeCreate(D dto, E entity) {}
    protected void beforeUpdate(D dto, E entity) {}

    @Transactional(readOnly = true)
    public Page<D> list(Pageable pageable) {
        return repo().findAll(pageable).map(mapper()::toDto);
    }

    @Transactional(readOnly = true)
    public D get(ID id) {
        var e = repo().findById(id).orElseThrow(() -> new EntityNotFoundException("Entity %s not found".formatted(id)));
        return mapper().toDto(e);
    }

    @Transactional
    public D create(D dto) {
        E e = mapper().toEntity(dto);
        beforeCreate(dto, e);
        e = repo().save(e);
        return mapper().toDto(e);
    }

    @Transactional
    public D update(ID id, D dto) {
        E e = repo().findById(id).orElseThrow(() -> new EntityNotFoundException("Entity %s not found".formatted(id)));
        mapper().updateEntityFromDto(dto, e);
        beforeUpdate(dto, e);
        e = repo().save(e);
        return mapper().toDto(e);
    }

    @Transactional
    public void delete(ID id) {
        if (!repo().existsById(id)) throw new EntityNotFoundException("Entity %s not found".formatted(id));
        repo().deleteById(id);
    }
}