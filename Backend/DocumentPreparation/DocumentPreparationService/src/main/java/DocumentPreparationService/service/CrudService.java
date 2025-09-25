package DocumentPreparationService.service;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IDokumentRepository;
import DocumentPreparationService.service.interfaces.ICrudService;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

import java.util.*;

public class CrudService<Entity,KeyType> implements ICrudService<Entity,KeyType> {

    private ICrudRepository<Entity,KeyType> repository;
    protected CrudService(ICrudRepository<Entity, KeyType> repository) {
        this.repository = repository;
    }
    @Override
    public Entity create(Entity entity) {
        return repository.save(entity);
    }

    @Override
    public Entity update(Entity entity) {
        return repository.save(entity);
    }

    @Override
    public boolean delete(KeyType key) {
        try
        {
            repository.deleteById(key);
            return true;
        } catch (EmptyResultDataAccessException ex) {
            return false;
        }
    }
    @Override
    public Optional<Entity> findById(KeyType id) {
        return repository.findById(id);
    }

    @Override
    public Set<Entity> findAll() {

        Iterable<Entity> iterable = repository.findAll();
        Set<Entity> set = new HashSet<>();
        for (Entity entity : iterable) {
            set.add(entity);
        }
        return set;
    }
}
