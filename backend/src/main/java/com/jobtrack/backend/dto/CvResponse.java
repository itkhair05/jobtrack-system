package com.jobtrack.backend.dto;

import java.time.LocalDateTime;

public record CvResponse(
        Long id,
        String title,
        String fileName,
        String downloadUrl,
        LocalDateTime createdAt) {
}
