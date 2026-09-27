package com.jobtrack.backend.controller;

import com.jobtrack.backend.dto.AnalyticsResponse;
import com.jobtrack.backend.service.AnalyticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/applications")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics")
    public AnalyticsResponse getOverview(@AuthenticationPrincipal String email) {
        return analyticsService.getOverview(email);
    }
}