import { type CvData, TemplateName, LayoutDensity } from './types';

export const LOCAL_STORAGE_KEY = 'ai-cv-maker-data-v4';

export const INITIAL_CV_DATA: CvData = {
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '123-456-7890',
  address: '123 Main St, Anytown, USA',
  linkedIn: 'linkedin.com/in/janedoe',
  summary: 'A highly motivated and results-oriented professional with a proven track record of success in project management. Seeking to leverage my skills and experience in a challenging new role.',
  workExperience: [
    {
      id: `work-${Date.now()}`,
      jobTitle: 'Project Manager',
      company: 'Tech Solutions Inc.',
      startDate: '2020-01-01',
      endDate: 'Present',
      description: '• Led cross-functional teams to deliver complex projects on time and within budget.\n• Developed and managed project plans, timelines, and budgets.\n• Communicated project status to stakeholders and managed expectations.'
    }
  ],
  education: [
    {
      id: `edu-${Date.now()}`,
      degree: 'B.S. in Business Administration',
      university: 'State University',
      graduationYear: '2019'
    }
  ],
  skills: 'Project Management, Agile Methodologies, Scrum, JIRA, Stakeholder Communication',
  projects: [],
  certifications: [],
  languages: ['English (Native)'],
  // Customization
  accentColor: '#58CC02',
  fontFamily: 'Nunito',
  sectionOrder: ['summary', 'workExperience', 'education', 'skills'],
  layoutDensity: 'Standard',
  theme: 'light',
};

type TemplateStyles = {
  [key in TemplateName]: {
    preview: string;
    header: string;
    name: string;
    contactInfo: string;
    sectionTitle: string;
    content: string;
    separator: string;
  }
};

export const TEMPLATES: TemplateStyles = {
  [TemplateName.Modern]: {
    preview: 'font-sans bg-white text-slate-800 p-8 shadow-lg',
    header: 'flex justify-between items-center pb-6 border-b-2 border-[--accent-color]',
    name: 'text-4xl font-bold text-slate-900',
    contactInfo: 'text-right text-sm text-slate-600',
    sectionTitle: 'text-xl font-bold text-[--accent-color] mt-6 mb-2 border-b border-slate-300 pb-1',
    content: 'text-sm leading-relaxed',
    separator: 'my-2'
  },
  [TemplateName.Classic]: {
    preview: 'font-serif bg-white text-gray-900 p-10 shadow-md',
    header: 'text-center pb-5 border-b-2 border-gray-400',
    name: 'text-5xl font-normal tracking-wider text-[--accent-color]',
    contactInfo: 'text-center text-xs text-gray-600 mt-2',
    sectionTitle: 'text-lg font-semibold uppercase tracking-widest text-gray-700 mt-8 mb-3 border-b border-gray-300 pb-1',
    content: 'text-base leading-snug',
    separator: 'my-3'
  },
  [TemplateName.Creative]: {
    preview: 'font-sans bg-slate-800 text-white p-8 shadow-xl relative',
    header: 'text-left pb-4',
    name: 'text-4xl font-extrabold text-[--accent-color]',
    contactInfo: 'text-left text-sm text-slate-300 pt-2',
    sectionTitle: 'text-lg font-bold uppercase text-[--accent-color] mt-6 mb-2',
    content: 'text-sm leading-relaxed text-slate-200',
    separator: 'my-2 opacity-50'
  }
};

export const DENSITY_STYLES: { [key in LayoutDensity]: { section: string, item: string } } = {
  Compact: {
    section: 'mt-3',
    item: 'mb-2'
  },
  Standard: {
    section: 'mt-4',
    item: 'mb-4'
  },
  Spacious: {
    section: 'mt-6',
    item: 'mb-6'
  },
};