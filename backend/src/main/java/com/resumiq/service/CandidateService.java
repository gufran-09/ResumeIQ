package com.resumiq.service;

import com.resumiq.domain.entity.Candidate;
import com.resumiq.domain.entity.CriteriaConfig;
import com.resumiq.domain.enums.CandidateStatus;
import com.resumiq.domain.enums.CollegeCategory;
import com.resumiq.dto.candidate.CandidateListItem;
import com.resumiq.dto.candidate.CandidateResponse;
import com.resumiq.dto.candidate.CandidateUploadRequest;
import com.resumiq.dto.common.PageResponse;
import com.resumiq.exception.ResourceNotFoundException;
import com.resumiq.repository.CandidateRepository;
import com.resumiq.repository.CriteriaRepository;
import com.resumiq.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final CriteriaRepository criteriaRepository;
    private final ScoringService scoringService;

    @Transactional(readOnly = true)
    public PageResponse<CandidateListItem> getCandidates(
            String search, String status, String degree, String department,
            String collegeCategory, Double minCgpa, Integer minExperience,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(
                sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "score"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        CandidateStatus statusEnum = null;
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                statusEnum = CandidateStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        CollegeCategory collegeEnum = null;
        if (collegeCategory != null && !collegeCategory.equalsIgnoreCase("all")) {
            try {
                String normalized = collegeCategory.replace("-", "_").toUpperCase();
                collegeEnum = CollegeCategory.valueOf(normalized);
            } catch (IllegalArgumentException ignored) {}
        }

        String searchParam = search != null ? search : "";
        String degreeParam = (degree == null || degree.equalsIgnoreCase("all")) ? null : degree;
        String deptParam = (department == null || department.equalsIgnoreCase("all")) ? null : department;
        Double cgpaParam = (minCgpa == null || minCgpa <= 0) ? null : minCgpa;
        Integer expParam = (minExperience == null || minExperience <= 0) ? null : minExperience;

        Page<Candidate> result = candidateRepository.findFiltered(
                searchParam, statusEnum, degreeParam, deptParam, collegeEnum, cgpaParam, expParam, pageable);

        List<CandidateListItem> items = result.getContent().stream().map(this::toListItem).toList();

        return PageResponse.<CandidateListItem>builder()
                .content(items)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public CandidateResponse getCandidateById(Long id) {
        Candidate c = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        return toResponse(c);
    }

    @Transactional(readOnly = true)
    public List<CandidateListItem> getRankedCandidates() {
        return candidateRepository.findAllByOrderByScoreDesc().stream().map(this::toListItem).toList();
    }

    @Transactional(readOnly = true)
    public List<CandidateListItem> getTopRanked(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return candidateRepository.findAllByOrderByScoreDesc(pageable).stream().map(this::toListItem).toList();
    }

    public CandidateResponse createCandidate(CandidateUploadRequest request) {
        CriteriaConfig criteria = criteriaRepository.findTopByOrderByIdDesc()
                .orElseGet(() -> CriteriaConfig.builder().build());

        CollegeCategory collegeCat = parseCollegeCategory(request.getCollegeCategory());

        Candidate candidate = Candidate.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .degree(request.getDegree())
                .institution(request.getInstitution())
                .collegeCategory(collegeCat)
                .cgpa(request.getCgpa())
                .graduationYear(request.getGraduationYear())
                .totalExperienceMonths(request.getTotalExperienceMonths() != null ? request.getTotalExperienceMonths() : 0)
                .skills(JsonUtil.toJson(request.getSkills()))
                .projects(JsonUtil.toJson(request.getProjects()))
                .certifications(JsonUtil.toJson(request.getCertifications()))
                .experience(JsonUtil.toJson(request.getExperience()))
                .resumeFileName(request.getResumeFileName())
                .resumeUrl(request.getResumeUrl())
                .build();

        ScoringService.ScoringResult scoring = scoringService.calculateScore(candidate, criteria);

        candidate.setScore(scoring.score());
        candidate.setStatus(scoringService.determineStatus(scoring.score()));
        candidate.setScoringBreakdown(JsonUtil.toJson(scoring.breakdown()));
        candidate.setSelectionReasons(JsonUtil.toJson(scoring.reasons()));

        return toResponse(candidateRepository.save(candidate));
    }

    public void deleteCandidate(Long id) {
        if (!candidateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Candidate not found with id: " + id);
        }
        candidateRepository.deleteById(id);
    }

    public void rescoreAll() {
        CriteriaConfig criteria = criteriaRepository.findTopByOrderByIdDesc()
                .orElseGet(() -> CriteriaConfig.builder().build());
        List<Candidate> all = candidateRepository.findAll();
        for (Candidate c : all) {
            ScoringService.ScoringResult scoring = scoringService.calculateScore(c, criteria);
            c.setScore(scoring.score());
            c.setStatus(scoringService.determineStatus(scoring.score()));
            c.setScoringBreakdown(JsonUtil.toJson(scoring.breakdown()));
            c.setSelectionReasons(JsonUtil.toJson(scoring.reasons()));
        }
        candidateRepository.saveAll(all);
    }

    private CandidateListItem toListItem(Candidate c) {
        return CandidateListItem.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .degree(c.getDegree())
                .institution(c.getInstitution())
                .collegeCategory(c.getCollegeCategory().name().replace("_", "-"))
                .cgpa(c.getCgpa())
                .totalExperienceMonths(c.getTotalExperienceMonths())
                .score(c.getScore())
                .status(c.getStatus().name().toLowerCase())
                .department(c.getDepartment())
                .uploadedAt(c.getUploadedAt() != null ? c.getUploadedAt().toString() : null)
                .build();
    }

    @SuppressWarnings("unchecked")
    private CandidateResponse toResponse(Candidate c) {
        List<String> skills = JsonUtil.fromJsonStringList(c.getSkills());

        List<Map<String, Object>> projects = JsonUtil.fromJsonList(c.getProjects(), Map.class)
                .stream().map(m -> (Map<String, Object>) m).toList();
        List<Map<String, Object>> certifications = JsonUtil.fromJsonList(c.getCertifications(), Map.class)
                .stream().map(m -> (Map<String, Object>) m).toList();
        List<Map<String, Object>> experience = JsonUtil.fromJsonList(c.getExperience(), Map.class)
                .stream().map(m -> (Map<String, Object>) m).toList();
        Map<String, Double> breakdown = JsonUtil.fromJsonList(c.getScoringBreakdown(), Map.class)
                .stream().map(m -> (Map<String, Object>) m)
                .findFirst()
                .map(m -> {
                    Map<String, Double> result = new java.util.HashMap<>();
                    m.forEach((k, v) -> result.put(k, ((Number) v).doubleValue()));
                    return result;
                })
                .orElse(Map.of());
        List<Map<String, String>> reasons = JsonUtil.fromJsonList(c.getSelectionReasons(), Map.class)
                .stream().map(m -> (Map<String, String>) m).toList();

        return CandidateResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .photoUrl(c.getPhotoUrl())
                .department(c.getDepartment())
                .degree(c.getDegree())
                .institution(c.getInstitution())
                .collegeCategory(c.getCollegeCategory().name().replace("_", "-"))
                .cgpa(c.getCgpa())
                .graduationYear(c.getGraduationYear())
                .totalExperienceMonths(c.getTotalExperienceMonths())
                .skills(skills)
                .projects(projects.stream().map(p -> CandidateResponse.ProjectDto.builder()
                        .title((String) p.get("title"))
                        .description((String) p.get("description"))
                        .technologies(JsonUtil.fromJsonStringList(JsonUtil.toJson(p.get("technologies"))))
                        .build()).toList())
                .certifications(certifications.stream().map(c2 -> CandidateResponse.CertificationDto.builder()
                        .name((String) c2.get("name"))
                        .issuer((String) c2.get("issuer"))
                        .year(c2.get("year") instanceof Number n ? n.intValue() : null)
                        .build()).toList())
                .experience(experience.stream().map(e -> CandidateResponse.ExperienceDto.builder()
                        .company((String) e.get("company"))
                        .role((String) e.get("role"))
                        .durationMonths(e.get("durationMonths") instanceof Number n ? n.intValue() : null)
                        .description((String) e.get("description"))
                        .build()).toList())
                .score(c.getScore())
                .status(c.getStatus().name().toLowerCase())
                .scoringBreakdown(CandidateResponse.ScoringBreakdownDto.builder()
                        .cgpa(breakdown.getOrDefault("cgpa", 0.0))
                        .skills(breakdown.getOrDefault("skills", 0.0))
                        .experience(breakdown.getOrDefault("experience", 0.0))
                        .projects(breakdown.getOrDefault("projects", 0.0))
                        .collegeCategory(breakdown.getOrDefault("collegeCategory", 0.0))
                        .total(breakdown.getOrDefault("total", 0.0))
                        .build())
                .selectionReasons(reasons.stream().map(r -> CandidateResponse.SelectionReasonDto.builder()
                        .type(r.get("type"))
                        .criterion(r.get("criterion"))
                        .detail(r.get("detail"))
                        .build()).toList())
                .resumeFileName(c.getResumeFileName())
                .resumeUrl(c.getResumeUrl())
                .uploadedAt(c.getUploadedAt() != null ? c.getUploadedAt().toString() : null)
                .build();
    }

    private CollegeCategory parseCollegeCategory(String cat) {
        if (cat == null) return CollegeCategory.TIER_3;
        return switch (cat.replace("-", "_").toUpperCase()) {
            case "TIER_1" -> CollegeCategory.TIER_1;
            case "TIER_2" -> CollegeCategory.TIER_2;
            default -> CollegeCategory.TIER_3;
        };
    }
}
