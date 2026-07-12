export type UserRole = 'admin' | 'evaluator' | 'hod';

export type CandidateStatus = 'shortlisted' | 'rejected' | 'pending';

export type CollegeCategory = 'Tier-1' | 'Tier-2' | 'Tier-3';

export type Department =
  | 'Computer Science'
  | 'Electronics'
  | 'Mechanical'
  | 'Civil'
  | 'Electrical'
  | 'Information Technology';

export type DegreeType =
  | 'B.Tech'
  | 'M.Tech'
  | 'B.E.'
  | 'M.E.'
  | 'B.Sc'
  | 'M.Sc'
  | 'BCA'
  | 'MCA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

export interface Education {
  id: string;
  degree: DegreeType;
  institution: string;
  collegeCategory: CollegeCategory;
  department: Department;
  cgpa: number;
  graduationYear: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  durationMonths: number;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
}

export interface ScoringBreakdown {
  cgpa: number;
  skills: number;
  experience: number;
  projects: number;
  collegeCategory: number;
  total: number;
}

export interface SelectionReason {
  type: 'positive' | 'negative';
  criterion: string;
  detail: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
  totalExperienceMonths: number;
  score: number;
  status: CandidateStatus;
  scoringBreakdown: ScoringBreakdown;
  selectionReasons: SelectionReason[];
  resumeFileName: string;
  resumeUrl: string;
  uploadedAt: string;
  department: Department;
}

export interface CriteriaConfig {
  cgpa: number;
  skills: number;
  experience: number;
  projects: number;
  collegeCategory: number;
  minCgpa: number;
  minExperienceMonths: number;
  requiredSkills: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DashboardStats {
  totalResumes: number;
  totalCandidates: number;
  shortlisted: number;
  rejected: number;
  pendingReview: number;
}
