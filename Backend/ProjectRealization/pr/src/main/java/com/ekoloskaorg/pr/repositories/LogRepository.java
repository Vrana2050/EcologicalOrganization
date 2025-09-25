package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Log;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogRepository extends JpaRepository<Log,Long> {
}
