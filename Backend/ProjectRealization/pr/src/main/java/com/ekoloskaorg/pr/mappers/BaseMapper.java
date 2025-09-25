package com.ekoloskaorg.pr.mappers;

public interface BaseMapper<E, D> {
    D toDto(E entity);
    E toEntity(D dto);
    void updateEntityFromDto(D dto, E entity);
}
