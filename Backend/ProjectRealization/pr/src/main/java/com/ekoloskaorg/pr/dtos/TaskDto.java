package com.ekoloskaorg.pr.dtos;

import java.time.LocalDateTime;

public record TaskDto(
        Long id,
        Long projectId,
        Long statusId,
        Long assignedMemberId,   // može biti null
        String name,
        String description,
        LocalDateTime deadline,        // može biti null
        LocalDateTime createdAt,       // može biti null
        LocalDateTime finishedAt       // može biti null
) {
}
