package com.ekoloskaorg.pr.repositories;

import com.ekoloskaorg.pr.dtos.AnalyticsSnapshot;
import com.ekoloskaorg.pr.dtos.StatusDurationDto;
import lombok.RequiredArgsConstructor;
import oracle.jdbc.internal.OracleTypes;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.*;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AnalyticsRepository {
    private final JdbcTemplate jdbc;

    public AnalyticsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 1) STATUS DURATIONS (koristi: f_status_durations(projectId, toTs))
    public List<StatusDurationDto> fetchStatusDurations(long projectId, Instant toTs) {
        String sql = """
            SELECT 
              d.status_id      AS status_id,
              d.status_name    AS status_name,
              d.avg_seconds    AS avg_seconds,
              d.samples        AS samples
            FROM TABLE(f_status_durations(?, ?)) d
            ORDER BY d.avg_seconds DESC
        """;

        return jdbc.query(
                sql,
                ps -> {
                    ps.setLong(1, projectId);
                    ps.setTimestamp(2, Timestamp.from(toTs));
                },
                (rs, i) -> new StatusDurationDto(
                        rs.getLong("status_id"),
                        rs.getString("status_name"),
                        rs.getBigDecimal("avg_seconds"),
                        rs.getLong("samples")
                )
        );
    }

    // 2) SNAPSHOT (koristi: f_report_snapshot(projectId)) - vraća 1 red u TABLE-u
    public AnalyticsSnapshot fetchSnapshot(long projectId) {
        String sql = """
            SELECT 
              r.total_tasks             AS total_tasks,
              r.total_comments          AS total_comments,
              r.avg_comments_per_task   AS avg_comments_per_task,
              r.members_count           AS members_count,
              r.avg_tasks_per_member    AS avg_tasks_per_member,
              r.tasks_on_time           AS tasks_on_time,
              r.tasks_late              AS tasks_late,
              r.bottleneck_status       AS bottleneck_status,
              r.bottleneck_avg_seconds  AS bottleneck_avg_seconds
            FROM TABLE(f_report_snapshot(?)) r
        """;

        return jdbc.query(sql, ps -> ps.setLong(1, projectId), rs -> {
            if (!rs.next()) {
                // funkcija baca grešku za ne-arhivirane projekte; ali ako vrati ništa:
                return new AnalyticsSnapshot(0L, BigDecimal.ZERO, 0L, BigDecimal.ZERO, 0L, 0L, null, null, 0L);
            }
            long totalTasks = rs.getLong("total_tasks");
            long totalComments = rs.getLong("total_comments");
            BigDecimal avgCommentsPerTask = rs.getBigDecimal("avg_comments_per_task");
            long membersCount = rs.getLong("members_count");
            BigDecimal avgTasksPerMember = rs.getBigDecimal("avg_tasks_per_member");
            long tasksOnTime = rs.getLong("tasks_on_time");
            long tasksLate = rs.getLong("tasks_late");
            String bottleneckStatus = rs.getString("bottleneck_status");
            BigDecimal bottleneckAvgSeconds = rs.getBigDecimal("bottleneck_avg_seconds");

            return new AnalyticsSnapshot(
                    totalTasks,
                    avgCommentsPerTask,
                    membersCount,
                    avgTasksPerMember,
                    tasksOnTime,
                    tasksLate,
                    bottleneckStatus,
                    bottleneckAvgSeconds,
                    totalComments
            );
        });
    }
}
