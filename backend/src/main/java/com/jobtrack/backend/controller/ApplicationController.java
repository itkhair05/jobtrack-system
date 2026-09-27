package com.jobtrack.backend.controller;

import com.jobtrack.backend.dto.ApplicationRequest;
import com.jobtrack.backend.dto.ApplicationDetailResponse;
import com.jobtrack.backend.dto.ApplicationResponse;
import com.jobtrack.backend.dto.StatusUpdateRequest;
import com.jobtrack.backend.entity.ApplicationStatus;
import com.jobtrack.backend.service.ApplicationService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public Page<ApplicationResponse> getApplications(
            @AuthenticationPrincipal String email,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return applicationService.findAll(email, status, search, pageable);
    }

    @GetMapping("/{id}")
    public ApplicationDetailResponse getApplication(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        return applicationService.findDetail(email, id);
    }

    @GetMapping("/follow-ups")
    public java.util.List<ApplicationResponse> getFollowUps(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "7") int days) {
        return applicationService.findFollowUps(email, days);
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.create(email, request);
        return ResponseEntity.created(URI.create("/api/v1/applications/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ApplicationResponse updateApplication(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequest request) {
        return applicationService.update(email, id, request);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse updateStatus(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return applicationService.updateStatus(email, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        applicationService.delete(email, id);
        return ResponseEntity.noContent().build();
    }
}
