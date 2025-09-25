package DocumentPreparationService.mapper;

import DocumentPreparationService.mapper.interfaces.IBaseConverter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class BaseMapper<Entity, Dto> implements IBaseConverter<Entity, Dto> {

    @Override
    public Entity ToEntity(Dto dto) {
        return null;
    }

    @Override
    public Dto ToDto(Entity entity) {
        return null;
    }

    @Override
    public Set<Dto> ToDtos(Set<Entity> entities) {
        Set<Dto> dtos = new HashSet<>();
        for (Entity entity : entities) {
            dtos.add(ToDto(entity));
        }
        return dtos;
    }

    @Override
    public Set<Entity> ToEntities(Set<Dto> dtos) {
        Set<Entity> entities = new HashSet<>();
        for (Dto dto : dtos) {
            entities.add(ToEntity(dto));
        }
        return entities;
    }
}
