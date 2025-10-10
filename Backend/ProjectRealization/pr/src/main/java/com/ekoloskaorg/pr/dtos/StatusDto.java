package com.ekoloskaorg.pr.dtos;

public record StatusDto ( Long id,
                          Long projectId,
                          Long orderNum,
                          String name,
                          Boolean terminal){
}
