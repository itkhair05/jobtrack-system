package com.jobtrack.backend.repository;

import com.jobtrack.backend.entity.ApplicationStatusLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationStatusLogRepository extends JpaRepository<ApplicationStatusLog, Long> {

	List<ApplicationStatusLog> findByApplication_IdOrderByChangedAtDesc(Long applicationId);
}
