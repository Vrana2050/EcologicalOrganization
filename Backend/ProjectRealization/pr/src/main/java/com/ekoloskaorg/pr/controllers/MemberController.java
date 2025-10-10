package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.MemberDto;
import com.ekoloskaorg.pr.services.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController extends AbstractCrudController<MemberDto, Long> {

    private final MemberService service;
    public MemberController(MemberService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/project/{id}")
    public ResponseEntity<List<MemberDto>> listByProjectId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findAllByProjectId(id));
    }
}
