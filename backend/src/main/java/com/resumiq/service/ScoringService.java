package com.resumiq.service;

import com.resumiq.domain.entity.Candidate;
import com.resumiq.domain.entity.CriteriaConfig;
import com.resumiq.domain.enums.CandidateStatus;
import com.resumiq.domain.enums.CollegeCategory;
import com.resumiq.util.JsonUtil;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ScoringService {

    public static record ScoringResult(
            double score,
            Map<String, Double> breakdown,
            List<Map<String, String>> reasons
    ) {}

    public ScoringResult calculateScore(Candidate candidate, CriteriaConfig criteria) {
        List<String> skills = JsonUtil.fromJsonStringList(candidate.getSkills());

        double cgpaScore = (candidate.getCgpa() / 10.0) * 100;
        double skillsScore = Math.min(100, (skills.size() / 10.0) * 100);
        double expScore = Math.min(100, (candidate.getTotalExperienceMonths() / 24.0) * 100);
        double projScore = 80;
        double collegeScore = switch (candidate.getCollegeCategory()) {
            case TIER_1 -> 100;
            case TIER_2 -> 70;
            case TIER_3 -> 40;
        };

        double total = (cgpaScore * criteria.getCgpaWeight() +
                skillsScore * criteria.getSkillsWeight() +
                expScore * criteria.getExperienceWeight() +
                projScore * criteria.getProjectsWeight() +
                collegeScore * criteria.getCollegeCategoryWeight()) / 100.0;

        double roundedScore = Math.round(total);

        Map<String, Double> breakdown = Map.of(
                "cgpa", round1(cgpaScore),
                "skills", round1(skillsScore),
                "experience", round1(expScore),
                "projects", round1(projScore),
                "collegeCategory", round1(collegeScore),
                "total", roundedScore
        );

        List<Map<String, String>> reasons = new ArrayList<>();
        List<String> requiredSkills = JsonUtil.fromJsonStringList(criteria.getRequiredSkills());

        if (candidate.getCgpa() >= criteria.getMinCgpa()) {
            reasons.add(Map.of("type", "positive", "criterion", "CGPA",
                    "detail", "CGPA " + candidate.getCgpa() + " meets minimum " + criteria.getMinCgpa()));
        } else {
            reasons.add(Map.of("type", "negative", "criterion", "CGPA",
                    "detail", "CGPA " + candidate.getCgpa() + " below minimum " + criteria.getMinCgpa()));
        }

        if (candidate.getTotalExperienceMonths() >= criteria.getMinExperienceMonths()) {
            reasons.add(Map.of("type", "positive", "criterion", "Experience",
                    "detail", candidate.getTotalExperienceMonths() + " months meets minimum " + criteria.getMinExperienceMonths()));
        } else {
            reasons.add(Map.of("type", "negative", "criterion", "Experience",
                    "detail", candidate.getTotalExperienceMonths() + " months below minimum " + criteria.getMinExperienceMonths()));
        }

        List<String> matched = skills.stream().filter(requiredSkills::contains).toList();
        if (matched.size() >= 2) {
            reasons.add(Map.of("type", "positive", "criterion", "Skills",
                    "detail", "Matches " + matched.size() + " required skills: " + String.join(", ", matched)));
        } else {
            reasons.add(Map.of("type", "negative", "criterion", "Skills",
                    "detail", "Only " + matched.size() + " of " + requiredSkills.size() + " required skills matched"));
        }

        if (candidate.getCollegeCategory() == CollegeCategory.TIER_1) {
            reasons.add(Map.of("type", "positive", "criterion", "College",
                    "detail", candidate.getInstitution() + " is a Tier-1 institution"));
        }

        return new ScoringResult(roundedScore, breakdown, reasons);
    }

    public CandidateStatus determineStatus(double score) {
        if (score >= 70) return CandidateStatus.SHORTLISTED;
        if (score < 50) return CandidateStatus.REJECTED;
        return CandidateStatus.PENDING;
    }

    private double round1(double n) {
        return Math.round(n * 10) / 10.0;
    }
}
