package com.jobtrack.backend.controller;

import com.jobtrack.backend.dto.ProfileUpdateRequest;
import com.jobtrack.backend.dto.AuthResponse;
import com.jobtrack.backend.dto.UserResponse;
import com.jobtrack.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse getProfile(@AuthenticationPrincipal String email) {
        return userService.getProfile(email);
    }

    @PutMapping("/profile")
    public AuthResponse updateProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(email, request);
    }
}
