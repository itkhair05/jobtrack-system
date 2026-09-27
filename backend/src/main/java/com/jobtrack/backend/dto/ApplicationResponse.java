package com.jobtrack.backend.dto;

import com.jobtrack.backend.entity.ApplicationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,
        Long companyId,
        String companyName,
        String website,
        String location,
        Long cvId,
        String cvTitle,
        String jobTitle,
        String jobUrl,
        String salaryRange,
        ApplicationStatus status,
        LocalDate appliedDate,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
