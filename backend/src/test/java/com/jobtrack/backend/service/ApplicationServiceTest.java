package com.jobtrack.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.jobtrack.backend.dto.ApplicationRequest;
import com.jobtrack.backend.entity.Application;
import com.jobtrack.backend.entity.ApplicationStatus;
import com.jobtrack.backend.entity.ApplicationStatusLog;
import com.jobtrack.backend.entity.Company;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.ApplicationRepository;
import com.jobtrack.backend.repository.ApplicationStatusLogRepository;
import com.jobtrack.backend.repository.CompanyRepository;
import com.jobtrack.backend.repository.CvRepository;
import com.jobtrack.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private ApplicationStatusLogRepository statusLogRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private CvRepository cvRepository;
    @Mock
    private UserRepository userRepository;

    private ApplicationService applicationService;
    private User user;
    private Application application;

    @BeforeEach
    void setUp() {
        applicationService = new ApplicationService(
                applicationRepository, statusLogRepository, companyRepository, cvRepository, userRepository);

        user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("hash");

        Company company = new Company();
        company.setUser(user);
        company.setName("ACME");

        application = new Application();
        application.setUser(user);
        application.setCompany(company);
        application.setJobTitle("Backend Developer");
        application.setStatus(ApplicationStatus.APPLIED);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(applicationRepository.findByIdAndUser_Id(any(), any())).thenReturn(Optional.of(application));
        when(companyRepository.findFirstByUser_IdAndNameIgnoreCase(any(), any())).thenReturn(Optional.of(company));
        when(companyRepository.save(any())).thenReturn(company);
    }

    @Test
    void updateLogsStatusChangeWhenStatusProvided() {
        applicationService.update("user@example.com", 1L, requestWithStatus(ApplicationStatus.OFFERED));

        ArgumentCaptor<ApplicationStatusLog> captor = ArgumentCaptor.forClass(ApplicationStatusLog.class);
        verify(statusLogRepository).save(captor.capture());
        assertThat(captor.getValue().getFromStatus()).isEqualTo("APPLIED");
        assertThat(captor.getValue().getToStatus()).isEqualTo("OFFERED");
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.OFFERED);
    }

    @Test
    void updateKeepsStatusAndSkipsLogWhenStatusOmitted() {
        applicationService.update("user@example.com", 1L, requestWithStatus(null));

        verify(statusLogRepository, never()).save(any());
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPLIED);
    }

    @Test
    void updateSkipsLogWhenStatusUnchanged() {
        applicationService.update("user@example.com", 1L, requestWithStatus(ApplicationStatus.APPLIED));

        verify(statusLogRepository, never()).save(any());
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPLIED);
    }

    private ApplicationRequest requestWithStatus(ApplicationStatus status) {
        return new ApplicationRequest(
                "ACME", null, null, null, "Backend Developer", null, null, status, null, null, null);
    }
}
