package com.resumiq.domain.entity;

import com.resumiq.domain.enums.CandidateStatus;
import com.resumiq.domain.enums.CollegeCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String photoUrl;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String degree;

    @Column(nullable = false)
    private String institution;

    @Enumerated(EnumType.STRING)
    @Column(name = "college_category", nullable = false, length = 10)
    private CollegeCategory collegeCategory;

    @Column(name = "cgpa", nullable = false)
    private Double cgpa;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "total_experience_months", nullable = false)
    @Builder.Default
    private Integer totalExperienceMonths = 0;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String projects;

    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(nullable = false)
    private Double score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private CandidateStatus status = CandidateStatus.PENDING;

    @Column(name = "scoring_breakdown", columnDefinition = "TEXT")
    private String scoringBreakdown;

    @Column(name = "selection_reasons", columnDefinition = "TEXT")
    private String selectionReasons;

    @Column(name = "resume_file_name")
    private String resumeFileName;

    @Column(name = "resume_url")
    private String resumeUrl;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;
}
