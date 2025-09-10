package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task,Long> {
}
