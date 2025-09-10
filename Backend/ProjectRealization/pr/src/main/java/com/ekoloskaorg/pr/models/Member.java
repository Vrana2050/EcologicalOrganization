package com.ekoloskaorg.pr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "MEMBERS")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @NotNull
    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Size(max = 5)
    @NotNull
    @Column(name = "ROLE_IN_PROJECT", nullable = false, length = 5)
    private String roleInProject;

    @Column(name = "JOINED_AT")
    private LocalDateTime joinedAt;

    @Column(name = "LEFT_AT")
    private LocalDateTime leftAt;

    @NotNull
    @ColumnDefault("1")
    @Column(name = "ACTIVE", nullable = false)
    private Boolean active = false;

}