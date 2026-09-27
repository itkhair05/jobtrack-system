package com.jobtrack.backend.repository;

import com.jobtrack.backend.entity.Application;
import com.jobtrack.backend.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

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

                @Query("""
                                                select a from Application a
                                                join fetch a.company
                                                where a.user.id = :userId
                                                        and a.followUpDate is not null
                                                        and a.followUpDate <= :until
                                                order by a.followUpDate asc
                                                """)
                List<Application> findFollowUps(@Param("userId") Long userId, @Param("until") LocalDate until);

                long countByUser_Id(Long userId);

                long countByUser_IdAndStatus(Long userId, ApplicationStatus status);

                @Query(value = """
                                select year(applied_date) as year_value, month(applied_date) as month_value, count(*) as count_value
                                from applications
                                where user_id = :userId and applied_date is not null
                                group by year(applied_date), month(applied_date)
                                order by year(applied_date), month(applied_date)
                                """, nativeQuery = true)
                List<Object[]> countByMonth(@Param("userId") Long userId);

                @org.springframework.data.jpa.repository.Modifying
                @Query("update Application a set a.cv = null where a.cv.id = :cvId")
                void detachCvFromApplications(@Param("cvId") Long cvId);
}
