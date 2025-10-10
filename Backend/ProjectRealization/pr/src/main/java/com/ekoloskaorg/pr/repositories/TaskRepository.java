package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task,Long> {

    List<Task> findAllByProjectId(Long projectId);
}
