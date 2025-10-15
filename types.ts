export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: "Present" | string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  university: string;
  graduationYear: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface Certification {
  id:string;
  name: string;
  issuingBody: string;
  year: string;
}

export type SectionKey = 'summary' | 'workExperience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages';

export type LayoutDensity = 'Compact' | 'Standard' | 'Spacious';
export type Theme = 'light' | 'dark';

export interface CvData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedIn: string;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string;
  projects: Project[];
  certifications: Certification[];
  languages: string[];
  // Customization
  accentColor: string;
  fontFamily: string;
  sectionOrder: SectionKey[];
  layoutDensity: LayoutDensity;
  theme: Theme;
}

export enum TemplateName {
  Modern = "Modern",
  Classic = "Classic",
  Creative = "Creative",
}

export interface AtsResult {
    matchScore: number;
    missingKeywords: string[];
    improvementTips: string[];
}