package com.jobtrack.backend.service;

import com.jobtrack.backend.dto.AnalyticsResponse;
import com.jobtrack.backend.entity.ApplicationStatus;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.ApplicationRepository;
import com.jobtrack.backend.repository.UserRepository;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getOverview(String email) {
        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found"));
        Map<ApplicationStatus, Long> byStatus = new EnumMap<>(ApplicationStatus.class);
        Arrays.stream(ApplicationStatus.values()).forEach(status -> byStatus.put(status, applicationRepository.countByUser_IdAndStatus(user.getId(), status)));
        List<AnalyticsResponse.MonthlyCount> byMonth = applicationRepository.countByMonth(user.getId()).stream()
                .map(row -> new AnalyticsResponse.MonthlyCount(((Number) row[0]).intValue(), ((Number) row[1]).intValue(), ((Number) row[2]).longValue()))
                .toList();
        return new AnalyticsResponse(applicationRepository.countByUser_Id(user.getId()), byStatus, byMonth);
    }
}