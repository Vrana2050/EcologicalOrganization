package com.ekoloskaorg.pr.controllers;


import com.ekoloskaorg.pr.dtos.CommentDto;
import com.ekoloskaorg.pr.services.CommentService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
public class CommentController extends AbstractCrudController<CommentDto,Long> {

    public CommentController(CommentService service) {
        super(service);
    }
}
