package com.resumiq.dto.candidate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String photoUrl;
    private String department;
    private String degree;
    private String institution;
    private String collegeCategory;
    private Double cgpa;
    private Integer graduationYear;
    private Integer totalExperienceMonths;
    private List<String> skills;
    private List<ProjectDto> projects;
    private List<CertificationDto> certifications;
    private List<ExperienceDto> experience;
    private Double score;
    private String status;
    private ScoringBreakdownDto scoringBreakdown;
    private List<SelectionReasonDto> selectionReasons;
    private String resumeFileName;
    private String resumeUrl;
    private String uploadedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDto {
        private String title;
        private String description;
        private List<String> technologies;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationDto {
        private String name;
        private String issuer;
        private Integer year;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExperienceDto {
        private String company;
        private String role;
        private Integer durationMonths;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoringBreakdownDto {
        private Double cgpa;
        private Double skills;
        private Double experience;
        private Double projects;
        private Double collegeCategory;
        private Double total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectionReasonDto {
        private String type;
        private String criterion;
        private String detail;
    }
}
