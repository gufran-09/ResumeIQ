import type { UserRole, Department, DegreeType, CollegeCategory } from '@/types';

export const APP_NAME = 'ResumeIQ';
export const APP_TAGLINE = 'Automated Resume Shortlisting System';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Candidates', href: '/candidates', icon: 'Users' },
  { label: 'Upload Resume', href: '/upload', icon: 'UploadCloud' },
  { label: 'Rankings', href: '/rankings', icon: 'Trophy' },
  { label: 'Criteria', href: '/criteria', icon: 'SlidersHorizontal' },
  { label: 'Reports', href: '/reports', icon: 'BarChart3' },
  { label: 'User Management', href: '/users', icon: 'UsersRound' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  evaluator: 'Evaluator',
  hod: 'Head of Department',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access including user management',
  evaluator: 'Can upload and review resumes',
  hod: 'Can configure shortlisting criteria',
};

export const DEPARTMENTS: Department[] = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
];

export const DEGREES: DegreeType[] = [
  'B.Tech',
  'M.Tech',
  'B.E.',
  'M.E.',
  'B.Sc',
  'M.Sc',
  'BCA',
  'MCA',
];

export const COLLEGE_CATEGORIES: CollegeCategory[] = ['Tier-1', 'Tier-2', 'Tier-3'];

export const SKILL_OPTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'Spring Boot', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Git',
  'C++', 'Go', 'Rust', 'Machine Learning', 'TensorFlow', 'PyTorch',
  'SQL', 'MongoDB', 'GraphQL', 'Redis', 'Kafka', 'Jenkins', 'CI/CD',
];

export const CRITERIA_LABELS = {
  cgpa: 'CGPA',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  collegeCategory: 'College Category',
} as const;

export const CRITERIA_MAX = 100;

export const STORAGE_KEYS = {
  theme: 'resumiq-theme',
  criteria: 'resumiq-criteria',
  auth: 'resumiq-auth',
} as const;

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@resumiq.com', password: 'admin' },
  evaluator: { email: 'evaluator@resumiq.com', password: 'eval' },
  hod: { email: 'hod@resumiq.com', password: 'hod' },
} as const;

