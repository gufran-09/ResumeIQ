package com.resumiq.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "criteria_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CriteriaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cgpa_weight", nullable = false)
    @Builder.Default
    private Integer cgpaWeight = 30;

    @Column(name = "skills_weight", nullable = false)
    @Builder.Default
    private Integer skillsWeight = 25;

    @Column(name = "experience_weight", nullable = false)
    @Builder.Default
    private Integer experienceWeight = 20;

    @Column(name = "projects_weight", nullable = false)
    @Builder.Default
    private Integer projectsWeight = 10;

    @Column(name = "college_category_weight", nullable = false)
    @Builder.Default
    private Integer collegeCategoryWeight = 15;

    @Column(name = "min_cgpa", nullable = false)
    @Builder.Default
    private Double minCgpa = 7.0;

    @Column(name = "min_experience_months", nullable = false)
    @Builder.Default
    private Integer minExperienceMonths = 6;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "updated_by")
    private String updatedBy;

    @CreationTimestamp
    @Column(name = "updated_at", updatable = false)
    private Instant updatedAt;
}
