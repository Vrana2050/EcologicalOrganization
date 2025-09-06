package DocumentPreparationService.service.interfaces;


import java.util.Optional;
import java.util.Set;

public interface ICrudService<Entity,KeyType> {
    public Entity create(Entity entity);
    public Entity update(Entity entity);
    public boolean delete(KeyType key);
    public Optional<Entity> findById(KeyType id);
    public Set<Entity> findAll();
}
