package com.ekoloskaorg.pr.repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDate;
/*

@RequiredArgsConstructor
public class AnalyticsRepository {
    private final JdbcTemplate jdbc;

    public AnalyticsSnapshot getSnapshot(long projectId, LocalDate from, LocalDate to) {
        return jdbc.execute((Connection con) -> {
            try (CallableStatement cs =
                         con.prepareCall("{ call PKG_ANALYTICS.pr_report_snapshot(?, ?, ?, ?) }")) {
                cs.setLong(1, projectId);
                cs.setTimestamp(2, Timestamp.valueOf(from.atStartOfDay()));
                cs.setTimestamp(3, Timestamp.valueOf(to.plusDays(1).atStartOfDay())); // < to+1
                cs.registerOutParameter(4, oracle.jdbc.OracleTypes.CURSOR);
                cs.execute();

                try (ResultSet rs = (ResultSet) cs.getObject(4)) {
                    if (rs.next()) {
                        return new AnalyticsSnapshot(
                                rs.getLong("total_tasks"),
                                rs.getLong("total_comments"),
                                rs.getBigDecimal("avg_comments_per_task"),
                                rs.getLong("members_count"),
                                rs.getBigDecimal("avg_tasks_per_member"),
                                rs.getLong("tasks_on_time"),
                                rs.getLong("tasks_late"),
                                rs.getString("bottleneck_status"),
                                rs.getBigDecimal("bottleneck_avg_seconds")
                        );
                    }
                    return new AnalyticsSnapshot(0, null, 0, null, 0, 0, null, null);
                }
            }
        });
    }

    public List<StatusDurationRow> getStatusDurations(long projectId, LocalDate from, LocalDate to) {
        String sql = """
      SELECT status_id, status_name, avg_seconds, samples
      FROM TABLE(PKG_ANALYTICS.f_status_durations(?, ?, ?))
      """;
        return jdbc.query(sql,
                ps -> {
                    ps.setLong(1, projectId);
                    ps.setTimestamp(2, Timestamp.valueOf(from.atStartOfDay()));
                    ps.setTimestamp(3, Timestamp.valueOf(to.plusDays(1).atStartOfDay()));
                },
                (rs, i) -> new StatusDurationRow(
                        rs.getLong("status_id"),
                        rs.getString("status_name"),
                        rs.getDouble("avg_seconds"),
                        rs.getLong("samples")
                )
        );
    }
}*/