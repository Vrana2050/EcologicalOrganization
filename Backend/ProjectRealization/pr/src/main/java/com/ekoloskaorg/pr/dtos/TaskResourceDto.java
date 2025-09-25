package com.ekoloskaorg.pr.dtos;

import java.math.BigDecimal;

public record TaskResourceDto (Long id,
                               Long taskId,
                               Long resourceId,
                               BigDecimal quantity,
                               Boolean provided){
}
