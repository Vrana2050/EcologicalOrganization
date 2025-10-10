package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogRepository extends JpaRepository<Log,Long> {
    Page<Log> findAllByProjectId(Pageable pageable,Long projectId);
}
