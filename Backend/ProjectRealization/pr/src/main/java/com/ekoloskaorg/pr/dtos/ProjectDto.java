package com.ekoloskaorg.pr.dtos;

import java.time.LocalDateTime;

public record ProjectDto(Long id,
                         String name,
                         String description,
                         String location,
                         LocalDateTime startDate,
                         LocalDateTime endDate,
                         Boolean archived,
                         Long templateId) {
}
