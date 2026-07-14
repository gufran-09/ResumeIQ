package com.resumiq.repository;

import com.resumiq.domain.entity.Candidate;
import com.resumiq.domain.enums.CandidateStatus;
import com.resumiq.domain.enums.CollegeCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    Page<Candidate> findAllByOrderByScoreDesc(Pageable pageable);

    List<Candidate> findAllByOrderByScoreDesc();

    long countByStatus(CandidateStatus status);

    @Query("SELECT c FROM Candidate c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:degree IS NULL OR c.degree = :degree) AND " +
           "(:department IS NULL OR c.department = :department) AND " +
           "(:collegeCategory IS NULL OR c.collegeCategory = :collegeCategory) AND " +
           "(:minCgpa IS NULL OR c.cgpa >= :minCgpa) AND " +
           "(:minExperience IS NULL OR c.totalExperienceMonths >= :minExperience) AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.institution) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Candidate> findFiltered(
            @Param("search") String search,
            @Param("status") CandidateStatus status,
            @Param("degree") String degree,
            @Param("department") String department,
            @Param("collegeCategory") CollegeCategory collegeCategory,
            @Param("minCgpa") Double minCgpa,
            @Param("minExperience") Integer minExperience,
            Pageable pageable);

    @Query("SELECT AVG(c.cgpa) FROM Candidate c")
    Double getAverageCgpa();

    @Query("SELECT AVG(c.totalExperienceMonths) FROM Candidate c")
    Double getAverageExperience();
}
