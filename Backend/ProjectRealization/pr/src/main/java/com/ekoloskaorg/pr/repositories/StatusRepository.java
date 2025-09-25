package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StatusRepository extends JpaRepository<Status,Long> {

    @Query(value = """
      SELECT s.*
        FROM Statuses s
       WHERE s.project_id = :projectId
         AND fn_is_transition_allowed(
               :projectId,
               :taskId,
               (SELECT t.status_id
                  FROM Tasks t
                 WHERE t.id = :taskId
                   AND t.project_id = :projectId),
               s.id
             ) = 1
       ORDER BY s.order_num
    """, nativeQuery = true)
    List<Status> findAllowedNextEntities(
            @Param("projectId") long projectId,
            @Param("taskId") long taskId
    );

}
