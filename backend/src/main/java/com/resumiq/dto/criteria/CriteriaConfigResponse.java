package com.resumiq.dto.criteria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaConfigResponse {
    private Long id;
    private Integer cgpa;
    private Integer skills;
    private Integer experience;
    private Integer projects;
    private Integer collegeCategory;
    private Double minCgpa;
    private Integer minExperienceMonths;
    private List<String> requiredSkills;
    private String updatedBy;
    private Instant updatedAt;
    private Integer total;
    private Boolean valid;
}
