package com.resumiq.service;

import com.resumiq.domain.entity.CriteriaConfig;
import com.resumiq.dto.criteria.CriteriaConfigRequest;
import com.resumiq.dto.criteria.CriteriaConfigResponse;
import com.resumiq.exception.BadRequestException;
import com.resumiq.repository.CandidateRepository;
import com.resumiq.repository.CriteriaRepository;
import com.resumiq.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CriteriaService {

    private final CriteriaRepository criteriaRepository;
    private final CandidateRepository candidateRepository;
    private final ScoringService scoringService;

    @Transactional(readOnly = true)
    public CriteriaConfigResponse getCurrentCriteria() {
        CriteriaConfig config = criteriaRepository.findTopByOrderByIdDesc()
                .orElseGet(() -> CriteriaConfig.builder()
                        .cgpaWeight(30).skillsWeight(25).experienceWeight(20)
                        .projectsWeight(10).collegeCategoryWeight(15)
                        .minCgpa(7.0).minExperienceMonths(6)
                        .requiredSkills(JsonUtil.toJson(List.of("JavaScript", "React", "Node.js")))
                        .build());
        return toResponse(config);
    }

    public CriteriaConfigResponse saveCriteria(CriteriaConfigRequest request, String updatedBy) {
        int total = request.getCgpa() + request.getSkills() + request.getExperience()
                + request.getProjects() + request.getCollegeCategory();

        if (total != 100) {
            throw new BadRequestException("Total weight must equal 100%. Current total: " + total + "%");
        }

        CriteriaConfig config = CriteriaConfig.builder()
                .cgpaWeight(request.getCgpa())
                .skillsWeight(request.getSkills())
                .experienceWeight(request.getExperience())
                .projectsWeight(request.getProjects())
                .collegeCategoryWeight(request.getCollegeCategory())
                .minCgpa(request.getMinCgpa())
                .minExperienceMonths(request.getMinExperienceMonths())
                .requiredSkills(JsonUtil.toJson(request.getRequiredSkills() != null ? request.getRequiredSkills() : List.of()))
                .updatedBy(updatedBy)
                .build();

        config = criteriaRepository.save(config);
        return toResponse(config);
    }

    @Transactional(readOnly = true)
    public PreviewResponse previewCriteria(CriteriaConfigRequest request) {
        int total = request.getCgpa() + request.getSkills() + request.getExperience()
                + request.getProjects() + request.getCollegeCategory();

        CriteriaConfig tempConfig = CriteriaConfig.builder()
                .cgpaWeight(request.getCgpa())
                .skillsWeight(request.getSkills())
                .experienceWeight(request.getExperience())
                .projectsWeight(request.getProjects())
                .collegeCategoryWeight(request.getCollegeCategory())
                .minCgpa(request.getMinCgpa() != null ? request.getMinCgpa() : 7.0)
                .minExperienceMonths(request.getMinExperienceMonths() != null ? request.getMinExperienceMonths() : 6)
                .requiredSkills(JsonUtil.toJson(request.getRequiredSkills() != null ? request.getRequiredSkills() : List.of()))
                .build();

        var allCandidates = candidateRepository.findAll();
        long shortlisted = 0, rejected = 0, pending = 0;

        for (var c : allCandidates) {
            var scoring = scoringService.calculateScore(c, tempConfig);
            var status = scoringService.determineStatus(scoring.score());
            switch (status) {
                case SHORTLISTED -> shortlisted++;
                case REJECTED -> rejected++;
                case PENDING -> pending++;
            }
        }

        return new PreviewResponse(shortlisted, rejected, pending, total, total == 100);
    }

    public record PreviewResponse(
            long shortlisted,
            long rejected,
            long pending,
            int total,
            boolean valid
    ) {}

    private CriteriaConfigResponse toResponse(CriteriaConfig c) {
        int total = c.getCgpaWeight() + c.getSkillsWeight() + c.getExperienceWeight()
                + c.getProjectsWeight() + c.getCollegeCategoryWeight();
        return CriteriaConfigResponse.builder()
                .id(c.getId())
                .cgpa(c.getCgpaWeight())
                .skills(c.getSkillsWeight())
                .experience(c.getExperienceWeight())
                .projects(c.getProjectsWeight())
                .collegeCategory(c.getCollegeCategoryWeight())
                .minCgpa(c.getMinCgpa())
                .minExperienceMonths(c.getMinExperienceMonths())
                .requiredSkills(JsonUtil.fromJsonStringList(c.getRequiredSkills()))
                .updatedBy(c.getUpdatedBy())
                .updatedAt(c.getUpdatedAt())
                .total(total)
                .valid(total == 100)
                .build();
    }
}
