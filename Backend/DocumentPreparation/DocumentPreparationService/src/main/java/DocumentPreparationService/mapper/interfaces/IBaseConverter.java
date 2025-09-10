package DocumentPreparationService.mapper.interfaces;

import java.util.Set;

public interface IBaseConverter<Entity, Dto> {
    public Entity ToEntity(Dto dto);
    public Dto ToDto(Entity entity);
    public Set<Dto> ToDtos(Set<Entity> entities);
    public Set<Entity> ToEntities(Set<Dto> dtos);
}
