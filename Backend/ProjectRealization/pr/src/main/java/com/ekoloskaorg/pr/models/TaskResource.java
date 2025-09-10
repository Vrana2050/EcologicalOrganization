package com.ekoloskaorg.pr.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "TASKRESOURCES")
public class TaskResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TASK_ID", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "RESOURCE_ID", nullable = false)
    private Resource resource;

    @Column(name = "QUANTITY", nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity;

    @Column(name = "PROVIDED", nullable = false)
    private Boolean provided;
}
