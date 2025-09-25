package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.services.AbstractCrudService;
import com.ekoloskaorg.pr.mappers.BaseMapper;
import com.ekoloskaorg.pr.dtos.MemberDto;
import com.ekoloskaorg.pr.mappers.MemberMapper;
import com.ekoloskaorg.pr.models.Member;
import com.ekoloskaorg.pr.models.Project;
import com.ekoloskaorg.pr.repositories.MemberRepository;
import com.ekoloskaorg.pr.repositories.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService extends AbstractCrudService<Member, Long, MemberDto> {

    private final MemberRepository repo;
    private final MemberMapper mapper;
    private final ProjectRepository projects;

    @Override protected JpaRepository<Member, Long> repo() { return repo; }
    @Override protected BaseMapper<Member, MemberDto> mapper() { return mapper; }

    @Override protected void beforeCreate(MemberDto dto, Member e) { validate(dto); wire(dto, e); }
    @Override protected void beforeUpdate(MemberDto dto, Member e) { validate(dto); wire(dto, e); }

    private void validate(MemberDto dto) {
        if (dto.projectId() == null) throw new IllegalArgumentException("projectId is required");
        if (dto.userId() == null)    throw new IllegalArgumentException("userId is required");
        if (dto.roleInProject() == null || !(dto.roleInProject().equals("GK")
                || dto.roleInProject().equals("PK")
                || dto.roleInProject().equals("NO"))) {
            throw new IllegalArgumentException("roleInProject must be one of: GK, PK, NO");
        }
        if (dto.active() == null) {
        }
    }

    private void wire(MemberDto dto, Member e) {
        Project p = projects.findById(dto.projectId())
                .orElseThrow(() -> new EntityNotFoundException("Project %d not found".formatted(dto.projectId())));
        e.setProject(p);
    }
}