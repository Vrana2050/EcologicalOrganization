package com.ekoloskaorg.pr.repositories;
import com.ekoloskaorg.pr.dtos.TaskResourceView;
import com.ekoloskaorg.pr.models.TaskResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskResourceRepository extends JpaRepository<TaskResource,Long> {

    boolean existsByTask_IdAndResource_Id(Long taskId, Long resourceId);


    @Query(value = """
    select
    tr.id              as id,
      r.id              as resourceId,
      r.name            as resourceName,
      r.description     as resourceDescription,
      tr.quantity       as quantity,
      tr.provided       as provided,
      u.id              as unitId,
      u.code            as unitCode
    from TaskResources tr
    join Resources r on r.id = tr.resource_id
    join UnitsOfMeasure u on u.id = r.unit_of_measure_id
    where tr.task_id = :taskId
    order by r.name asc
""", nativeQuery = true)
    List<TaskResourceView> findForByTaskId(@Param("taskId") Long taskId);

}
