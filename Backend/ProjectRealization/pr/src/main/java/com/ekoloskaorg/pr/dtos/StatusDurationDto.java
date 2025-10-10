package com.ekoloskaorg.pr.dtos;

import java.math.BigDecimal;

public record StatusDurationDto(
        Long statusId,
        String statusName,
        BigDecimal avgSeconds,
        Long samples
) {}