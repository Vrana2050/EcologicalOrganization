package com.ekoloskaorg.pr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "STATUSES")
@Getter @Setter
public class Status {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @Column(name = "ORDER_NUM", nullable = false)
    private Long orderNum;

    @Column(name = "NAME", nullable = false)
    private String name;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "TERMINAL", nullable = false)
    private Boolean terminal = false;
}
