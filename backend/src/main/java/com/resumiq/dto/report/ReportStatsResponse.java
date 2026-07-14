package com.resumiq.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportStatsResponse {
    private Double averageCgpa;
    private Double averageExperience;
    private Double selectionPercentage;
    private Long totalCandidates;
    private Long shortlisted;
    private Long rejected;
    private Long pendingReview;
    private List<SkillCount> topSkills;
    private List<CollegeCount> topColleges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillCount {
        private String name;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeCount {
        private String name;
        private Long count;
    }
}
