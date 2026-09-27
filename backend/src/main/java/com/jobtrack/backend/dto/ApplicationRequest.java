package com.jobtrack.backend.dto;

import com.jobtrack.backend.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ApplicationRequest(
        @NotBlank @Size(max = 150) String companyName,
        @Size(max = 255) String website,
        @Size(max = 150) String location,
        Long cvId,
        @NotBlank @Size(max = 150) String jobTitle,
        String jobUrl,
        @Size(max = 100) String salaryRange,
        ApplicationStatus status,
        LocalDate appliedDate,
        String notes) {
}
