package com.jobtrack.backend.dto;

import com.jobtrack.backend.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull ApplicationStatus status,
        String note) {
}
