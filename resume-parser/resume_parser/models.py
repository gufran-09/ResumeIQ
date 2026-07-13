"""Pydantic models for request and response schemas."""

from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class EducationInfo(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    college_category: Optional[str] = None
    department: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None


class ExperienceInfo(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration_months: Optional[int] = None
    description: Optional[str] = None


class ProjectInfo(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: list[str] = Field(default_factory=list)


class CertificationInfo(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[int] = None


class ParsedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    education: list[EducationInfo] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceInfo] = Field(default_factory=list)
    projects: list[ProjectInfo] = Field(default_factory=list)
    certifications: list[CertificationInfo] = Field(default_factory=list)
    total_experience_months: int = 0
    raw_text_length: int = 0
    extraction_confidence: float = Field(
        0.0, description="Confidence score 0-1 based on how many fields were extracted"
    )


class ParseResponse(BaseModel):
    success: bool = True
    message: str = "Resume parsed successfully"
    data: ParsedResume
    file_name: Optional[str] = None
    file_type: Optional[str] = None


class ParseError(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None


class SkillMatchResult(BaseModel):
    raw_skill: str
    matched_skill: str
    confidence: float
