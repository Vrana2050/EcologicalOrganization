package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource,Long> {
}
