package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.StatusTransition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusTransitionRepository extends JpaRepository<StatusTransition,Long> {
    boolean existsByProject_IdAndFromStatus_IdAndToStatus_Id(Long projectId, Long fromStatusId, Long toStatusId);
}
