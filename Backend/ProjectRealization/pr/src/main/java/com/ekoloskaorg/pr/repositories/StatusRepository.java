package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Status;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusRepository extends JpaRepository<Status,Long> {
}
