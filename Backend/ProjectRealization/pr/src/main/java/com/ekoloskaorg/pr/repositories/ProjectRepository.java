package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project,Long> {
    Page<Project> findAllByArchivedFalse(Pageable pageable);
    Page<Project> findAllByArchivedTrue(Pageable pageable);
}
