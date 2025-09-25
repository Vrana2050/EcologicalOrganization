package com.ekoloskaorg.pr.repositories;


import com.ekoloskaorg.pr.models.TaskResource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskResourceRepository extends JpaRepository<TaskResource,Long> {

    boolean existsByTask_IdAndResource_Id(Long taskId, Long resourceId);
}
