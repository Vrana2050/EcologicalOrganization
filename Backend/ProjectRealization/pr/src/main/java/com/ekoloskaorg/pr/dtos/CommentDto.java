package com.ekoloskaorg.pr.dtos;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        Long projectId,
        Long taskId,
        Long memberId,
        String text,
        LocalDateTime createdAt
) {
}
