package com.jobtrack.backend.dto;

import java.util.List;

public record ApplicationDetailResponse(
        ApplicationResponse application,
        List<StatusLogResponse> timeline) {
}
