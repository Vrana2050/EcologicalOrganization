package com.ekoloskaorg.pr.repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.CallableStatement;
import java.sql.Connection;

@Repository
public class TaskRepositoryCustom {
    private final JdbcTemplate jdbc;
    public TaskRepositoryCustom(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    public void changeStatus(long projectId, long taskId, long toStatusId, long changedByMemberId) {
        jdbc.execute((Connection con) -> {
            try (CallableStatement cs = con.prepareCall("{ call pr_change_status(?, ?, ?, ?) }")) {
                cs.setLong(1, projectId);
                cs.setLong(2, taskId);
                cs.setLong(3, toStatusId);
                cs.setLong(4, changedByMemberId);
                cs.execute();
            }
            return null;
        });
    }
}
