package com.jobtrack.backend.repository;

import com.jobtrack.backend.entity.ApplicationStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationStatusLogRepository extends JpaRepository<ApplicationStatusLog, Long> {
}
