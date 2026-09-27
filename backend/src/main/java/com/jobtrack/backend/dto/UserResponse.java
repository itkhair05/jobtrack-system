package com.jobtrack.backend.dto;

public record UserResponse(Long id, String email, String fullName, String role) {
}
