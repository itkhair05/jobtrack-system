package com.jobtrack.backend.dto;

import java.time.LocalDateTime;

public record StatusLogResponse(
        Long id,
        String fromStatus,
        String toStatus,
        String note,
        LocalDateTime changedAt) {
}
