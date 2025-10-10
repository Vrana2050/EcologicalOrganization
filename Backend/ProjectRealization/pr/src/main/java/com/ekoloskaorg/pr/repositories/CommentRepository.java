package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment,Long> {
    interface CommentCount {
        Long getTaskId();
        Long getCnt();
    }

    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    @Query("""
    select c.task.id as taskId, count(c.id) as cnt
    from Comment c
    where c.task.id in :ids
    group by c.task.id
  """)
    List<CommentCount> countByTaskIds(@Param("ids") List<Long> ids);
}
