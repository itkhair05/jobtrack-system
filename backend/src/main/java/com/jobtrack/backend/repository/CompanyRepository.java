package com.jobtrack.backend.repository;

import com.jobtrack.backend.entity.Company;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findFirstByUser_IdAndNameIgnoreCase(Long userId, String name);
}
