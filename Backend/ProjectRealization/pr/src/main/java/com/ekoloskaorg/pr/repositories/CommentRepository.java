package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment,Long> {
}
