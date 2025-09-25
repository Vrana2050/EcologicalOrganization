package com.ekoloskaorg.pr.dtos;

import java.time.LocalDateTime;

public record TaskStatusHistoryDto(Long id,
                                   Long taskId,
                                   Long statusId,
                                   LocalDateTime changedAt ) {
}
