package com.resumiq.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalResumes;
    private Long totalCandidates;
    private Long shortlisted;
    private Long rejected;
    private Long pendingReview;
}
