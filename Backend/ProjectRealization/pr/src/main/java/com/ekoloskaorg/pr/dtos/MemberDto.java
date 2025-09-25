package com.ekoloskaorg.pr.dtos;

import java.time.LocalDateTime;

public record MemberDto(
        Long id,
        Long projectId,
        Long userId,
        String roleInProject,   // "GK", "PK", "NO"
        LocalDateTime joinedAt,
        LocalDateTime leftAt,
        Boolean active
) {
}
