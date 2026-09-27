package com.jobtrack.backend.dto;

public record AuthResponse(String token, UserResponse user) {
}
