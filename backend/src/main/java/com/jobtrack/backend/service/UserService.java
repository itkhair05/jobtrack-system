package com.jobtrack.backend.service;

import com.jobtrack.backend.dto.ProfileUpdateRequest;
import com.jobtrack.backend.dto.AuthResponse;
import com.jobtrack.backend.dto.UserResponse;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.UserRepository;
import com.jobtrack.backend.security.JwtTokenProvider;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        return toResponse(findUser(email));
    }

    @Transactional
    public AuthResponse updateProfile(String currentEmail, ProfileUpdateRequest request) {
        User user = findUser(currentEmail);
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (!email.equals(user.getEmail()) && userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        boolean changingEmail = !email.equals(user.getEmail());
        boolean changingPassword = request.newPassword() != null && !request.newPassword().isBlank();
        if (changingEmail || changingPassword) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required");
            }
            if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
            }
        }

        user.setEmail(email);
        user.setFullName(request.fullName() == null ? null : request.fullName().trim());
        if (changingPassword) user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        User savedUser = userRepository.save(user);
        UserResponse response = toResponse(savedUser);
        return new AuthResponse(tokenProvider.createToken(savedUser.getEmail(), savedUser.getRole()), response);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
