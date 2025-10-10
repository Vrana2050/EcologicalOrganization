package com.ekoloskaorg.pr.dtos;

import java.math.BigDecimal;

public record AnalyticsSnapshot(
        Long totalTasks,
        BigDecimal avgCommentsPerTask,
        Long membersCount,
        BigDecimal avgTasksPerMember,
        Long tasksOnTime,
        Long tasksLate,
        String bottleneckStatus,
        BigDecimal bottleneckAvgSeconds,
        Long totalComments
) {}