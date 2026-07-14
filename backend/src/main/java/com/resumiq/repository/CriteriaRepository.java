package com.resumiq.repository;

import com.resumiq.domain.entity.CriteriaConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CriteriaRepository extends JpaRepository<CriteriaConfig, Long> {

    Optional<CriteriaConfig> findTopByOrderByIdDesc();
}
