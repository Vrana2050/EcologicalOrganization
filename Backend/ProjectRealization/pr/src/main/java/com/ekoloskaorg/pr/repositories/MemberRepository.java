package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.models.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member,Long> {
}
