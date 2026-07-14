package com.resumiq.service;

import com.resumiq.domain.enums.CandidateStatus;
import com.resumiq.dto.report.ReportStatsResponse;
import com.resumiq.repository.CandidateRepository;
import com.resumiq.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final CandidateRepository candidateRepository;

    public ReportStatsResponse getReportStats() {
        var candidates = candidateRepository.findAll();
        long total = candidates.size();

        double avgCgpa = candidates.stream().mapToDouble(c -> c.getCgpa()).average().orElse(0);
        double avgExp = candidates.stream().mapToInt(c -> c.getTotalExperienceMonths()).average().orElse(0);
        long shortlisted = candidateRepository.countByStatus(CandidateStatus.SHORTLISTED);
        long rejected = candidateRepository.countByStatus(CandidateStatus.REJECTED);
        long pending = candidateRepository.countByStatus(CandidateStatus.PENDING);
        double selectionPct = total > 0 ? (shortlisted * 100.0 / total) : 0;

        Map<String, Long> skillCounts = new HashMap<>();
        for (var c : candidates) {
            for (String s : JsonUtil.fromJsonStringList(c.getSkills())) {
                skillCounts.merge(s, 1L, Long::sum);
            }
        }
        List<ReportStatsResponse.SkillCount> topSkills = skillCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> ReportStatsResponse.SkillCount.builder().name(e.getKey()).count(e.getValue()).build())
                .toList();

        Map<String, Long> collegeCounts = candidates.stream()
                .collect(Collectors.groupingBy(c -> c.getInstitution(), Collectors.counting()));
        List<ReportStatsResponse.CollegeCount> topColleges = collegeCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> ReportStatsResponse.CollegeCount.builder().name(e.getKey()).count(e.getValue()).build())
                .toList();

        return ReportStatsResponse.builder()
                .averageCgpa(Math.round(avgCgpa * 100) / 100.0)
                .averageExperience(Math.round(avgExp * 10) / 10.0)
                .selectionPercentage(Math.round(selectionPct * 10) / 10.0)
                .totalCandidates(total)
                .shortlisted(shortlisted)
                .rejected(rejected)
                .pendingReview(pending)
                .topSkills(topSkills)
                .topColleges(topColleges)
                .build();
    }
}
