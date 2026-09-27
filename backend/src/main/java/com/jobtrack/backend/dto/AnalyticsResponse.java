package com.jobtrack.backend.dto;

import com.jobtrack.backend.entity.ApplicationStatus;
import java.util.List;
import java.util.Map;

public record AnalyticsResponse(
        long total,
        Map<ApplicationStatus, Long> byStatus,
        List<MonthlyCount> byMonth) {

    public record MonthlyCount(int year, int month, long count) { }
}
