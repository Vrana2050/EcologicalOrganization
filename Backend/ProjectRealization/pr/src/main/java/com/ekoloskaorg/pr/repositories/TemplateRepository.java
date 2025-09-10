package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Template;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateRepository extends JpaRepository<Template,Long> {
    boolean existsByProject_Id(Long projectId);
}
