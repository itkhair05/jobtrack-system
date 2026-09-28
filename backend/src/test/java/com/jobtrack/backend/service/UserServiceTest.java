package com.jobtrack.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.jobtrack.backend.dto.AuthResponse;
import com.jobtrack.backend.dto.ProfileUpdateRequest;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.UserRepository;
import com.jobtrack.backend.security.JwtTokenProvider;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;

    private UserService userService;
    private User user;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, tokenProvider);
        user = new User();
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        user.setPasswordHash("hash");
    }

    @Test
    void updateProfileRequiresCurrentPasswordWhenEmailChanges() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile("user@example.com", request("new@example.com", null, null)))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).isEqualTo("Current password is required");
                });
        assertThat(user.getEmail()).isEqualTo("user@example.com");
    }

    @Test
    void updateProfileRejectsIncorrectPasswordWhenEmailChanges() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> userService.updateProfile("user@example.com", request("new@example.com", "wrong", null)))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).isEqualTo("Current password is incorrect");
                });
        assertThat(user.getEmail()).isEqualTo("user@example.com");
    }

    @Test
    void updateProfileChangesEmailWithCorrectPassword() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(userRepository.save(any())).thenReturn(user);
        when(tokenProvider.createToken("new@example.com", user.getRole())).thenReturn("new-token");

        AuthResponse response = userService.updateProfile("user@example.com", request("new@example.com", "secret", null));

        assertThat(user.getEmail()).isEqualTo("new@example.com");
        assertThat(response.token()).isEqualTo("new-token");
        assertThat(response.user().email()).isEqualTo("new@example.com");
    }

    @Test
    void updateProfileKeepsEmailWithoutPasswordWhenNothingChanges() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(tokenProvider.createToken("user@example.com", user.getRole())).thenReturn("token");

        AuthResponse response = userService.updateProfile("user@example.com", request("user@example.com", null, null));

        assertThat(user.getEmail()).isEqualTo("user@example.com");
        assertThat(response.user().email()).isEqualTo("user@example.com");
        verifyNoInteractions(passwordEncoder);
    }

    private ProfileUpdateRequest request(String email, String currentPassword, String newPassword) {
        return new ProfileUpdateRequest(email, "Test User", currentPassword, newPassword);
    }
}
