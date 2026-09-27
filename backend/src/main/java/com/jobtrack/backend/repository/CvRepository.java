package com.jobtrack.backend.repository;

import com.jobtrack.backend.entity.Cv;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CvRepository extends JpaRepository<Cv, Long> {

    Optional<Cv> findByIdAndUser_Id(Long id, Long userId);
}
