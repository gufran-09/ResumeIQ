package com.resumiq.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardChartsResponse {

    private List<ChartItem> statusDistribution;
    private List<ChartItem> collegeCategory;
    private List<ChartItem> skillsDistribution;
    private List<ChartItem> cgpaDistribution;
    private List<ChartItem> experienceDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartItem {
        private String name;
        private Long value;
    }
}
