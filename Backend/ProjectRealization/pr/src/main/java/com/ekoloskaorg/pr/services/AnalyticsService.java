package com.ekoloskaorg.pr.services;

import com.ekoloskaorg.pr.dtos.AnalyticsSnapshot;
import com.ekoloskaorg.pr.dtos.StatusDurationDto;
import com.ekoloskaorg.pr.repositories.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsRepository repo;

    @Transactional(readOnly = true)
    public List<StatusDurationDto> getStatusDurations(long projectId, Instant toTs) {
        return repo.fetchStatusDurations(projectId, toTs);
    }

    @Transactional(readOnly = true)
    public AnalyticsSnapshot getSnapshot(long projectId) {
        try {
            return repo.fetchSnapshot(projectId);
        } catch (DataAccessException ex) {
            // f_report_snapshot baca RAISE_APPLICATION_ERROR(-20010, ...)
            // ovde možeš prevesti poruku u svoj domen izuzetaka
            throw ex;
        }
    }
}
