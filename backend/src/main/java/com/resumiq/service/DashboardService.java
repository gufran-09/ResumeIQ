package com.resumiq.service;

import com.resumiq.domain.enums.CandidateStatus;
import com.resumiq.domain.enums.CollegeCategory;
import com.resumiq.dto.dashboard.DashboardChartsResponse;
import com.resumiq.dto.dashboard.DashboardStatsResponse;
import com.resumiq.repository.CandidateRepository;
import com.resumiq.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CandidateRepository candidateRepository;

    public DashboardStatsResponse getStats() {
        long total = candidateRepository.count();
        return DashboardStatsResponse.builder()
                .totalResumes(total)
                .totalCandidates(total)
                .shortlisted(candidateRepository.countByStatus(CandidateStatus.SHORTLISTED))
                .rejected(candidateRepository.countByStatus(CandidateStatus.REJECTED))
                .pendingReview(candidateRepository.countByStatus(CandidateStatus.PENDING))
                .build();
    }

    public DashboardChartsResponse getCharts() {
        var candidates = candidateRepository.findAll();

        List<DashboardChartsResponse.ChartItem> statusDist = List.of(
                chartItem("Shortlisted", candidates.stream().filter(c -> c.getStatus() == CandidateStatus.SHORTLISTED).count()),
                chartItem("Rejected", candidates.stream().filter(c -> c.getStatus() == CandidateStatus.REJECTED).count()),
                chartItem("Pending", candidates.stream().filter(c -> c.getStatus() == CandidateStatus.PENDING).count())
        );

        List<DashboardChartsResponse.ChartItem> collegeDist = Arrays.stream(CollegeCategory.values())
                .map(cat -> chartItem(cat.name().replace("_", "-"),
                        candidates.stream().filter(c -> c.getCollegeCategory() == cat).count()))
                .toList();

        Map<String, Long> skillCounts = new HashMap<>();
        for (var c : candidates) {
            for (String s : JsonUtil.fromJsonStringList(c.getSkills())) {
                skillCounts.merge(s, 1L, Long::sum);
            }
        }
        List<DashboardChartsResponse.ChartItem> skillsDist = skillCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> chartItem(e.getKey(), e.getValue()))
                .toList();

        double[][] cgpaRanges = {{6, 7}, {7, 8}, {8, 9}, {9, 10.01}};
        String[] cgpaLabels = {"6.0-7.0", "7.0-8.0", "8.0-9.0", "9.0-10.0"};
        List<DashboardChartsResponse.ChartItem> cgpaDist = new ArrayList<>();
        for (int i = 0; i < cgpaRanges.length; i++) {
            double min = cgpaRanges[i][0], max = cgpaRanges[i][1];
            long count = candidates.stream()
                    .filter(c -> c.getCgpa() >= min && c.getCgpa() < max)
                    .count();
            cgpaDist.add(chartItem(cgpaLabels[i], count));
        }

        int[][] expRanges = {{0, 6}, {6, 12}, {12, 24}, {24, 36}};
        String[] expLabels = {"0-6m", "6-12m", "1-2y", "2-3y"};
        List<DashboardChartsResponse.ChartItem> expDist = new ArrayList<>();
        for (int i = 0; i < expRanges.length; i++) {
            int min = expRanges[i][0], max = expRanges[i][1];
            long count = candidates.stream()
                    .filter(c -> c.getTotalExperienceMonths() >= min && c.getTotalExperienceMonths() < max)
                    .count();
            expDist.add(chartItem(expLabels[i], count));
        }

        return DashboardChartsResponse.builder()
                .statusDistribution(statusDist)
                .collegeCategory(collegeDist)
                .skillsDistribution(skillsDist)
                .cgpaDistribution(cgpaDist)
                .experienceDistribution(expDist)
                .build();
    }

    private DashboardChartsResponse.ChartItem chartItem(String name, long value) {
        return DashboardChartsResponse.ChartItem.builder().name(name).value(value).build();
    }
}
