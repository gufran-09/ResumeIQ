package com.resumiq.dto.criteria;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaConfigRequest {

    @NotNull(message = "CGPA weight is required")
    @Min(value = 0, message = "Weight cannot be negative")
    @Max(value = 100, message = "Weight cannot exceed 100")
    private Integer cgpa;

    @NotNull(message = "Skills weight is required")
    @Min(value = 0)
    @Max(value = 100)
    private Integer skills;

    @NotNull(message = "Experience weight is required")
    @Min(value = 0)
    @Max(value = 100)
    private Integer experience;

    @NotNull(message = "Projects weight is required")
    @Min(value = 0)
    @Max(value = 100)
    private Integer projects;

    @NotNull(message = "College category weight is required")
    @Min(value = 0)
    @Max(value = 100)
    private Integer collegeCategory;

    @Min(value = 0)
    @Max(value = 10)
    private Double minCgpa;

    @Min(value = 0)
    private Integer minExperienceMonths;

    private List<String> requiredSkills;
}
