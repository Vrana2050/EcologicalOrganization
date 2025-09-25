package com.ekoloskaorg.pr.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "LOGSTATISTICS")
public class LogStatistic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @Size(max = 7)
    @Column(name = "MONTH", length = 7)
    private String month;

    @Column(name = "STATUS_CHANGE_COUNT")
    private Long statusChangeCount;

    @Column(name = "COMMENT_COUNT")
    private Long commentCount;

    @Column(name = "USER_COUNT")
    private Long userCount;

    @Column(name = "ENTRY_DATE")
    private Instant entryDate;

}