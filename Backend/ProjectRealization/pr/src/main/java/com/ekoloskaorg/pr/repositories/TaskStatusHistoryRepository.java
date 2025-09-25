package com.ekoloskaorg.pr.repositories;


import com.ekoloskaorg.pr.models.TaskStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskStatusHistoryRepository extends JpaRepository<TaskStatusHistory,Long> {
}
