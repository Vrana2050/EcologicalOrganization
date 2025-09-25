package com.ekoloskaorg.pr.models;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;

@Entity
@Table(name = "STATUSTRANSITIONS")
@Getter @Setter
public class StatusTransition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "STATUS_ID_FROM", nullable = false)
    private Status fromStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "STATUS_ID_TO", nullable = false)
    private Status toStatus;
}
