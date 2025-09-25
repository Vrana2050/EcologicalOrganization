package com.ekoloskaorg.pr.dtos;

public record ResourceDto(Long id,
                          String name,
                          String description,
                          Long unitOfMeasureId) {
}
