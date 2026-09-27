package com.jobtrack.backend.repository;

import com.jobtrack.backend.entity.Application;
import com.jobtrack.backend.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByUser_Id(Long userId, Pageable pageable);

    Page<Application> findByUser_IdAndStatus(Long userId, ApplicationStatus status, Pageable pageable);

    @Query("""
            select a from Application a
            join a.company company
            where a.user.id = :userId
              and (:status is null or a.status = :status)
              and (:search is null or :search = ''
                   or lower(a.jobTitle) like lower(concat('%', :search, '%'))
                   or lower(company.name) like lower(concat('%', :search, '%')))
            """)
    Page<Application> searchByUser(
            @Param("userId") Long userId,
            @Param("status") ApplicationStatus status,
            @Param("search") String search,
            Pageable pageable);

    java.util.Optional<Application> findByIdAndUser_Id(Long id, Long userId);
}
