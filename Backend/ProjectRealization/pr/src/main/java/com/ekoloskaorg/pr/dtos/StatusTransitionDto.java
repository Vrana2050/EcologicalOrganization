package com.ekoloskaorg.pr.dtos;

public record StatusTransitionDto (Long id,
                                   Long projectId,
                                   Long fromStatusId,
                                   Long toStatusId){
}
