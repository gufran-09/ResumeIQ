package com.resumiq.dto.candidate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateListItem {
    private Long id;
    private String name;
    private String email;
    private String degree;
    private String institution;
    private String collegeCategory;
    private Double cgpa;
    private Integer totalExperienceMonths;
    private Double score;
    private String status;
    private String department;
    private String uploadedAt;
}
