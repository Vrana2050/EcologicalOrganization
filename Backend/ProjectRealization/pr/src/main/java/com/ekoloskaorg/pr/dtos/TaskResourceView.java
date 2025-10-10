package com.ekoloskaorg.pr.dtos;

import java.math.BigDecimal;

public interface TaskResourceView {
    Long getId();
    Long getResourceId();
    String getResourceName();
    String getResourceDescription();
    BigDecimal getQuantity();
    Integer  getProvided();
    Long getUnitId();
    String getUnitCode();
}