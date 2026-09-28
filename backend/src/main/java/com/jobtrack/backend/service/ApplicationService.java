package com.jobtrack.backend.service;

import com.jobtrack.backend.dto.ApplicationRequest;
import com.jobtrack.backend.dto.ApplicationDetailResponse;
import com.jobtrack.backend.dto.ApplicationResponse;
import com.jobtrack.backend.dto.StatusLogResponse;
import com.jobtrack.backend.dto.StatusUpdateRequest;
import com.jobtrack.backend.entity.Application;
import com.jobtrack.backend.entity.ApplicationStatus;
import com.jobtrack.backend.entity.ApplicationStatusLog;
import com.jobtrack.backend.entity.Company;
import com.jobtrack.backend.entity.Cv;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.ApplicationRepository;
import com.jobtrack.backend.repository.ApplicationStatusLogRepository;
import com.jobtrack.backend.repository.CompanyRepository;
import com.jobtrack.backend.repository.CvRepository;
import com.jobtrack.backend.repository.UserRepository;
import java.util.Locale;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusLogRepository statusLogRepository;
    private final CompanyRepository companyRepository;
    private final CvRepository cvRepository;
    private final UserRepository userRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            ApplicationStatusLogRepository statusLogRepository,
            CompanyRepository companyRepository,
            CvRepository cvRepository,
            UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.statusLogRepository = statusLogRepository;
        this.companyRepository = companyRepository;
        this.cvRepository = cvRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> findAll(
            String email,
            ApplicationStatus status,
            String search,
            Pageable pageable) {
        User user = findUser(email);
        String normalizedSearch = search == null ? null : search.trim();
        return applicationRepository.searchByUser(user.getId(), status, normalizedSearch, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> findFollowUps(String email, int days) {
        User user = findUser(email);
        LocalDate until = LocalDate.now().plusDays(Math.min(Math.max(days, 0), 30));
        return applicationRepository.findFollowUps(user.getId(), until).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ApplicationResponse create(String email, ApplicationRequest request) {
        User user = findUser(email);
        Application application = new Application();
        application.setUser(user);
        applyRequest(application, user, request);
        Application saved = applicationRepository.save(application);
        saveStatusLog(saved, null, saved.getStatus().name(), "Đơn ứng tuyển được tạo");
        return toResponse(saved);
    }

    @Transactional
    public ApplicationResponse update(String email, Long id, ApplicationRequest request) {
        User user = findUser(email);
        Application application = findApplication(id, user.getId());
        ApplicationStatus previousStatus = application.getStatus();
        applyRequest(application, user, request);
        if (request.status() != null && previousStatus != request.status()) {
            saveStatusLog(application, previousStatus.name(), request.status().name(), "Cập nhật từ trang chỉnh sửa đơn");
        }
        return toResponse(application);
    }

        @Transactional(readOnly = true)
        public ApplicationDetailResponse findDetail(String email, Long id) {
        User user = findUser(email);
        Application application = findApplication(id, user.getId());
        return new ApplicationDetailResponse(
            toResponse(application),
            statusLogRepository.findByApplication_IdOrderByChangedAtDesc(application.getId())
                .stream()
                .map(log -> new StatusLogResponse(
                    log.getId(), log.getFromStatus(), log.getToStatus(), log.getNote(), log.getChangedAt()))
                .toList());
        }

    @Transactional
    public ApplicationResponse updateStatus(String email, Long id, StatusUpdateRequest request) {
        User user = findUser(email);
        Application application = findApplication(id, user.getId());
        ApplicationStatus previousStatus = application.getStatus();

        if (previousStatus != request.status()) {
            saveStatusLog(application, previousStatus == null ? null : previousStatus.name(), request.status().name(), request.note());
            application.setStatus(request.status());
        }

        return toResponse(application);
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = findUser(email);
        applicationRepository.delete(findApplication(id, user.getId()));
    }

    private void applyRequest(Application application, User user, ApplicationRequest request) {
        String companyName = request.companyName().trim();
        Company company = companyRepository.findFirstByUser_IdAndNameIgnoreCase(user.getId(), companyName)
                .orElseGet(() -> {
                    Company newCompany = new Company();
                    newCompany.setUser(user);
                    newCompany.setName(companyName);
                    return newCompany;
                });
        if (request.website() != null) company.setWebsite(request.website().trim());
        if (request.location() != null) company.setLocation(request.location().trim());
        application.setCompany(companyRepository.save(company));

        Cv cv = request.cvId() == null ? null : cvRepository.findByIdAndUser_Id(request.cvId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV does not belong to the current user"));
        application.setCv(cv);
        application.setJobTitle(request.jobTitle().trim());
        application.setJobUrl(trimToNull(request.jobUrl()));
        application.setSalaryRange(trimToNull(request.salaryRange()));
        application.setStatus(request.status() == null ? application.getStatus() : request.status());
        application.setAppliedDate(request.appliedDate());
        application.setFollowUpDate(request.followUpDate());
        application.setNotes(trimToNull(request.notes()));
    }

    private void saveStatusLog(Application application, String fromStatus, String toStatus, String note) {
        ApplicationStatusLog log = new ApplicationStatusLog();
        log.setApplication(application);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setNote(note);
        statusLogRepository.save(log);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found"));
    }

    private Application findApplication(Long id, Long userId) {
        return applicationRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    private ApplicationResponse toResponse(Application application) {
        Company company = application.getCompany();
        Cv cv = application.getCv();
        return new ApplicationResponse(
                application.getId(),
                company.getId(),
                company.getName(),
                company.getWebsite(),
                company.getLocation(),
                cv == null ? null : cv.getId(),
                cv == null ? null : cv.getTitle(),
                application.getJobTitle(),
                application.getJobUrl(),
                application.getSalaryRange(),
                application.getStatus(),
                application.getAppliedDate(),
                application.getNotes(),
                application.getCreatedAt(),
                application.getUpdatedAt(),
                application.getFollowUpDate());
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
