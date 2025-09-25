package com.ekoloskaorg.pr.models;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;


import java.time.Instant;
import java.time.LocalDateTime;


@Entity
@Table(name = "TASKS")
@Getter @Setter
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "DESCRIPTION", nullable = false)
    private String description;

    @Column(name = "DEADLINE", nullable = false)
    private LocalDateTime deadline;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "STATUS_ID", nullable = false)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNED_MEMBER_ID")
    private Member assignedMember;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "FINISHED_AT")
    private LocalDateTime finishedAt;
}
