package com.ekoloskaorg.pr.dtos;

import java.time.LocalDateTime;

public record LogDto(Long id,
                     Long projectId,
                     Long memberId,
                     Long taskId,
                     String action,
                     LocalDateTime timestamp) {
}
