package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StatusRepository extends JpaRepository<Status,Long> {

    @Query(value = """
      WITH cur AS (
        SELECT t.status_id
        FROM   Tasks t
        WHERE  t.id = :taskId
          AND  t.project_id = :projectId
      )
      SELECT s.*
      FROM   Statuses s
      CROSS  JOIN cur
      WHERE  s.project_id = :projectId
        AND  s.id <> cur.status_id 
        AND  fn_is_transition_allowed(
               :projectId, :taskId, cur.status_id, s.id
             ) = 1
      ORDER  BY s.order_num
    """, nativeQuery = true)
    List<Status> findAllowedNextStatuses(
            @Param("projectId") long projectId,
            @Param("taskId") long taskId
    );

    List<Status> findAllByProjectIdOrderByOrderNum(long projectId);
}
