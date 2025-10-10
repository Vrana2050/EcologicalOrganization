package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member,Long> {

    List<Member> findAllByProjectId(Long projectId);
}
