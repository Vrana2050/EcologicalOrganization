package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.MemberDto;
import com.ekoloskaorg.pr.services.MemberService;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
public class MemberController extends AbstractCrudController<MemberDto, Long> {

    public MemberController(MemberService service) {
        super(service);
    }
}
