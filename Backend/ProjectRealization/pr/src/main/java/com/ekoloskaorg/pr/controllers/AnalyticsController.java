package com.ekoloskaorg.pr.controllers;

import com.ekoloskaorg.pr.dtos.AnalyticsSnapshot;
import com.ekoloskaorg.pr.dtos.StatusDurationDto;
import com.ekoloskaorg.pr.services.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService service;

    @GetMapping("/{projectId}/durations")
    public List<StatusDurationDto> durations(
            @PathVariable long projectId,
            @RequestParam("toTs")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant toTs
    ) {
        return service.getStatusDurations(projectId, toTs);
    }

    @GetMapping("/{projectId}/snapshot")
    public AnalyticsSnapshot snapshot(@PathVariable long projectId) {
        return service.getSnapshot(projectId);
    }
}