package com.jobtrack.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank @Email @Size(max = 100) String email,
        @Size(max = 100) String fullName,
        String currentPassword,
        @Size(min = 8, max = 100) String newPassword) {
}
