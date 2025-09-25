package com.ekoloskaorg.pr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "RESOURCES")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "NAME", nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "UNIT_OF_MEASURE_ID", nullable = false)
    private UnitsOfMeasure unitOfMeasure;

}