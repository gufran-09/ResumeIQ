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
public class CandidateUploadRequest {
    private String name;
    private String email;
    private String phone;
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
    private String resumeFileName;
    private String resumeUrl;

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
}
