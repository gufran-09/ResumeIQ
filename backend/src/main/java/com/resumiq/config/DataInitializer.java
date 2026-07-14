package com.resumiq.config;

import com.resumiq.domain.entity.Candidate;
import com.resumiq.domain.entity.CriteriaConfig;
import com.resumiq.domain.entity.User;
import com.resumiq.domain.enums.AccountStatus;
import com.resumiq.domain.enums.CandidateStatus;
import com.resumiq.domain.enums.CollegeCategory;
import com.resumiq.domain.enums.UserRole;
import com.resumiq.repository.CandidateRepository;
import com.resumiq.repository.CriteriaRepository;
import com.resumiq.repository.UserRepository;
import com.resumiq.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CriteriaRepository criteriaRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String[] FIRST_NAMES = {"Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Priya", "Ananya", "Diya", "Saanvi", "Rohan"};
    private static final String[] LAST_NAMES = {"Sharma", "Verma", "Gupta", "Patel", "Reddy", "Nair", "Singh", "Kumar", "Rao", "Joshi"};
    private static final String[] COLLEGES = {"IIT Bombay", "IIT Delhi", "NIT Trichy", "BITS Pilani", "VIT Vellore", "SRM Chennai", "Manipal Institute", "Local Engineering College"};
    private static final String[] DEGREES = {"B.Tech", "M.Tech", "B.E.", "MCA"};
    private static final String[] DEPARTMENTS = {"Computer Science", "Information Technology", "Electronics", "Mechanical"};
    private static final String[] SKILLS = {"JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "Spring Boot", "PostgreSQL", "Docker", "AWS", "Git", "Machine Learning"};

    @Override
    public void run(String... args) {
        seedUsers();
        seedCriteria();
        // seedCandidates(); // Disable mock candidate generation
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        log.info("Seeding demo users...");
        userRepository.saveAll(List.of(
                buildUser("Admin User", "admin@resumiq.com", "admin123", UserRole.ADMIN, "Computer Science"),
                buildUser("Jane Evaluator", "evaluator@resumiq.com", "eval123", UserRole.EVALUATOR, "Information Technology"),
                buildUser("Dr. HOD", "hod@resumiq.com", "hod123", UserRole.HOD, "Computer Science")
        ));
        log.info("Seeded {} demo users", userRepository.count());
    }

    private User buildUser(String name, String email, String password, UserRole role, String dept) {
        return User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .department(dept)
                .status(AccountStatus.ACTIVE)
                .lastActive(Instant.now())
                .build();
    }

    private void seedCriteria() {
        if (criteriaRepository.count() > 0) return;

        log.info("Seeding default criteria...");
        criteriaRepository.save(CriteriaConfig.builder()
                .cgpaWeight(30)
                .skillsWeight(25)
                .experienceWeight(20)
                .projectsWeight(10)
                .collegeCategoryWeight(15)
                .minCgpa(7.0)
                .minExperienceMonths(6)
                .requiredSkills(JsonUtil.toJson(List.of("JavaScript", "React", "Node.js")))
                .updatedBy("System")
                .build());
    }

    private void seedCandidates() {
        if (candidateRepository.count() > 0) return;

        log.info("Seeding sample candidates...");
        CriteriaConfig criteria = criteriaRepository.findTopByOrderByIdDesc().orElse(null);
        if (criteria == null) return;

        List<Candidate> candidates = new java.util.ArrayList<>();
        for (int i = 0; i < 20; i++) {
            String firstName = FIRST_NAMES[ThreadLocalRandom.current().nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[ThreadLocalRandom.current().nextInt(LAST_NAMES.length)];
            String name = firstName + " " + lastName;
            String college = COLLEGES[ThreadLocalRandom.current().nextInt(COLLEGES.length)];
            CollegeCategory cat = college.startsWith("IIT") || college.equals("BITS Pilani") || college.equals("NIT Trichy")
                    ? CollegeCategory.TIER_1
                    : college.equals("VIT Vellore") || college.equals("SRM Chennai") || college.equals("Manipal Institute")
                    ? CollegeCategory.TIER_2
                    : CollegeCategory.TIER_3;
            double cgpa = Math.round((6.5 + ThreadLocalRandom.current().nextDouble(3.5)) * 10) / 10.0;
            int expMonths = ThreadLocalRandom.current().nextInt(36);
            List<String> skills = pickSkills();
            String degree = DEGREES[ThreadLocalRandom.current().nextInt(DEGREES.length)];
            String dept = DEPARTMENTS[ThreadLocalRandom.current().nextInt(DEPARTMENTS.length)];

            Candidate candidate = Candidate.builder()
                    .name(name)
                    .email(firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com")
                    .phone("+91 " + (9000000000L + ThreadLocalRandom.current().nextLong(999999999L)))
                    .department(dept)
                    .degree(degree)
                    .institution(college)
                    .collegeCategory(cat)
                    .cgpa(cgpa)
                    .graduationYear(2020 + ThreadLocalRandom.current().nextInt(5))
                    .totalExperienceMonths(expMonths)
                    .skills(JsonUtil.toJson(skills))
                    .projects(JsonUtil.toJson(List.of(
                            Map.of("title", "E-Commerce Platform", "description", "Full-stack web app",
                                    "technologies", List.of("React", "Node.js", "PostgreSQL")),
                            Map.of("title", "AI Chatbot", "description", "NLP-based assistant",
                                    "technologies", List.of("Python", "TensorFlow"))
                    )))
                    .certifications(JsonUtil.toJson(List.of(
                            Map.of("name", "AWS Certified Developer", "issuer", "Amazon", "year", 2023)
                    )))
                    .experience(JsonUtil.toJson(List.of(
                            Map.of("company", "Google", "role", "SDE Intern", "durationMonths", 6,
                                    "description", "Backend development")
                    )))
                    .resumeFileName(firstName + "_" + lastName + "_Resume.pdf")
                    .resumeUrl("#")
                    .build();

            double cgpaScore = (cgpa / 10.0) * 100;
            double skillsScore = Math.min(100, (skills.size() / 10.0) * 100);
            double expScore = Math.min(100, (expMonths / 24.0) * 100);
            double projScore = 80;
            double collegeScore = cat == CollegeCategory.TIER_1 ? 100 : cat == CollegeCategory.TIER_2 ? 70 : 40;

            double score = Math.round(
                    (cgpaScore * criteria.getCgpaWeight() + skillsScore * criteria.getSkillsWeight() +
                     expScore * criteria.getExperienceWeight() + projScore * criteria.getProjectsWeight() +
                     collegeScore * criteria.getCollegeCategoryWeight()) / 100.0
            );

            candidate.setScore(score);
            candidate.setStatus(score >= 70 ? CandidateStatus.SHORTLISTED : score < 50 ? CandidateStatus.REJECTED : CandidateStatus.PENDING);
            candidate.setScoringBreakdown(JsonUtil.toJson(Map.of(
                    "cgpa", Math.round(cgpaScore * 10) / 10.0,
                    "skills", Math.round(skillsScore * 10) / 10.0,
                    "experience", Math.round(expScore * 10) / 10.0,
                    "projects", projScore,
                    "collegeCategory", collegeScore,
                    "total", score
            )));
            candidate.setSelectionReasons(JsonUtil.toJson(List.of(
                    Map.of("type", cgpa >= criteria.getMinCgpa() ? "positive" : "negative",
                            "criterion", "CGPA",
                            "detail", "CGPA " + cgpa + (cgpa >= criteria.getMinCgpa() ? " meets" : " below") + " minimum " + criteria.getMinCgpa())
            )));

            candidates.add(candidate);
        }

        candidateRepository.saveAll(candidates);
        log.info("Seeded {} candidates", candidates.size());
    }

    private List<String> pickSkills() {
        int count = 4 + ThreadLocalRandom.current().nextInt(6);
        var shuffled = java.util.Arrays.asList(SKILLS);
        java.util.Collections.shuffle(shuffled);
        return shuffled.subList(0, Math.min(count, shuffled.size()));
    }
}
