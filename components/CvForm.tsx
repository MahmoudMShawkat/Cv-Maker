import React, { useState } from 'react';
import { type CvData, type WorkExperience, type Education, TemplateName, type Project, type Certification, SectionKey, LayoutDensity, Theme } from '../types';
import { Section } from './Section';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Icon } from './Icon';
import { FeedbackTips } from './FeedbackTips';
import { generateSummary, generateDescription, suggestSkills, rephraseSummary, rephraseExperienceDescription } from '../services/geminiService';
import { EmptyState } from './EmptyState';

interface CvFormProps {
  cvData: CvData;
  onDataChange: (data: CvData) => void;
  onTemplateChange: (template: TemplateName) => void;
  activeTemplate: TemplateName;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  onDownloadTxt: () => void;
  onShare: () => void;
  onGenerateCoverLetter: (jobDescription: string) => void;
  onImportData: () => void;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
}

const ALL_SECTIONS: { key: SectionKey; name: string }[] = [
  { key: 'summary', name: 'Summary' },
  { key: 'workExperience', name: 'Work Experience' },
  { key: 'education', name: 'Education' },
  { key: 'skills', name: 'Skills' },
  { key: 'projects', name: 'Projects' },
  { key: 'certifications', name: 'Certifications' },
  { key: 'languages', name: 'Languages' },
];

const FONT_OPTIONS = ['Nunito', 'Lato', 'Merriweather', 'Roboto'];
const DENSITY_OPTIONS: LayoutDensity[] = ['Compact', 'Standard', 'Spacious'];


export const CvForm: React.FC<CvFormProps> = (props) => {
  const { cvData, onDataChange, onTemplateChange, activeTemplate, onDownloadPdf, onDownloadDocx, onDownloadTxt, onShare, onGenerateCoverLetter, onImportData, onToggleTheme, onOpenCommandPalette } = props;

  const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});
  const [jobDescription, setJobDescription] = useState('');

  const handleFieldChange = (field: keyof CvData, value: any) => {
    onDataChange({ ...cvData, [field]: value });
  };

  const handleNestedChange = <T,>(section: keyof CvData, index: number, field: keyof T, value: string) => {
    const sectionData = [...cvData[section] as T[]] as T[];
    sectionData[index] = { ...sectionData[index], [field]: value };
    onDataChange({ ...cvData, [section]: sectionData });
  };

  const handleListChange = (section: 'languages', index: number, value: string) => {
    const sectionData = [...cvData[section]];
    sectionData[index] = value;
    onDataChange({ ...cvData, [section]: sectionData });
  }
  
  const addListItem = <T,>(section: keyof CvData, newItem: T) => {
    const sectionData = [...cvData[section] as T[]] as T[];
    onDataChange({ ...cvData, [section]: [...sectionData, newItem] });
  };
  
  const removeListItem = (section: keyof CvData, id: string) => {
    const sectionData = [...cvData[section] as any[]].filter(item => item.id !== id);
    onDataChange({ ...cvData, [section]: sectionData });
  };

  const removeLanguageItem = (index: number) => {
      const languages = [...cvData.languages].filter((_, i) => i !== index);
      onDataChange({ ...cvData, languages });
  }

  const handleGenerateSummary = async () => {
    setAiLoading({ ...aiLoading, summary: true });
    try {
      const enhanced = await generateSummary(cvData, jobDescription);
      handleFieldChange('summary', enhanced);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setAiLoading({ ...aiLoading, summary: false });
    }
  };

  const handleEnhanceSummary = async () => {
    setAiLoading({ ...aiLoading, enhanceSummary: true });
    try {
      const enhanced = await rephraseSummary(cvData.summary);
      handleFieldChange('summary', enhanced);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setAiLoading({ ...aiLoading, enhanceSummary: false });
    }
  };

  const handleSuggestDescription = async (workId: string, jobTitle: string, index: number) => {
    setAiLoading({ ...aiLoading, [workId]: true });
    try {
      const suggestion = await generateDescription(jobTitle, jobDescription);
      handleNestedChange<WorkExperience>('workExperience', index, 'description', suggestion);
    } catch (error) {
       alert((error as Error).message);
    } finally {
       setAiLoading({ ...aiLoading, [workId]: false });
    }
  };

  const handleEnhanceDescription = async (workId: string, jobTitle: string, description: string, index: number) => {
    setAiLoading({ ...aiLoading, [`enhance-${workId}`]: true });
    try {
      const suggestion = await rephraseExperienceDescription(jobTitle, description);
      handleNestedChange<WorkExperience>('workExperience', index, 'description', suggestion);
    } catch (error) {
       alert((error as Error).message);
    } finally {
       setAiLoading({ ...aiLoading, [`enhance-${workId}`]: false });
    }
  };

  const handleSuggestSkills = async () => {
    setAiLoading({ ...aiLoading, skills: true });
    try {
      const suggestion = await suggestSkills(cvData, jobDescription);
      const existingSkills = cvData.skills ? cvData.skills.split(',').map(s => s.trim()) : [];
      const newSkills = suggestion.split(',').map(s => s.trim());
      const mergedSkills = [...new Set([...existingSkills, ...newSkills])].join(', ');
      handleFieldChange('skills', mergedSkills);
    } catch (error) {
       alert((error as Error).message);
    } finally {
       setAiLoading({ ...aiLoading, skills: false });
    }
  }
  
  const handleSectionOrderChange = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...cvData.sectionOrder];
    const item = newOrder[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    newOrder[index] = newOrder[swapIndex];
    newOrder[swapIndex] = item;
    handleFieldChange('sectionOrder', newOrder);
  };

  const addSection = (sectionKey: SectionKey) => {
    if (!cvData.sectionOrder.includes(sectionKey)) {
        handleFieldChange('sectionOrder', [...cvData.sectionOrder, sectionKey]);
    }
  };

  const removeSection = (sectionKey: SectionKey) => {
     handleFieldChange('sectionOrder', cvData.sectionOrder.filter(key => key !== sectionKey));
  };

  const availableSectionsToAdd = ALL_SECTIONS.filter(s => !cvData.sectionOrder.includes(s.key));

  const renderSectionControls = (sectionKey: SectionKey, index: number) => {
    const isOptional = !['summary', 'workExperience', 'education', 'skills'].includes(sectionKey);
    return (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
            <Button variant="ghost" onClick={() => handleSectionOrderChange(index, 'up')} disabled={index === 0} className="!p-2 h-8 w-8"><Icon name="arrow-up" className="w-4 h-4" /></Button>
            <Button variant="ghost" onClick={() => handleSectionOrderChange(index, 'down')} disabled={index === cvData.sectionOrder.length - 1} className="!p-2 h-8 w-8"><Icon name="arrow-down" className="w-4 h-4" /></Button>
            {isOptional && <Button variant="ghost" onClick={() => removeSection(sectionKey)} className="!p-2 h-8 w-8 text-red-500 hover:bg-red-100"><Icon name="trash" className="w-4 h-4"/></Button>}
        </div>
    );
  }

  const sectionRenderers: { [key in SectionKey]: () => React.ReactNode } = {
    summary: () => (
        <Section title="Professional Summary">
            <Textarea label="Summary" value={cvData.summary} onChange={(e) => handleFieldChange('summary', e.target.value)} rows={4}/>
            <div className="mt-2">
                <Button variant="ai" onClick={handleEnhanceSummary} loading={aiLoading['enhanceSummary']} disabled={!cvData.summary}>
                    <Icon name="sparkle" /> AI Enhance
                </Button>
            </div>
        </Section>
    ),
    workExperience: () => (
      <Section title="Work Experience">
        {cvData.workExperience.length > 0 ? (
          cvData.workExperience.map((work, index) => (
            <div key={work.id} className="p-4 border border-[var(--border-primary)] rounded-lg space-y-4 animate-fade-in-slide-down">
               <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[var(--text-secondary)]">Job #{index + 1}</h3>
                <Button variant="ghost" className="!p-2" onClick={() => removeListItem('workExperience', work.id)}><Icon name="trash" /></Button>
               </div>
               <Input label="Job Title" value={work.jobTitle} onChange={e => handleNestedChange<WorkExperience>('workExperience', index, 'jobTitle', e.target.value)} />
               <Input label="Company" value={work.company} onChange={e => handleNestedChange<WorkExperience>('workExperience', index, 'company', e.target.value)} />
               <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="date" value={work.startDate} onChange={e => handleNestedChange<WorkExperience>('workExperience', index, 'startDate', e.target.value)} />
                  <Input label="End Date" value={work.endDate} onChange={e => handleNestedChange<WorkExperience>('workExperience', index, 'endDate', e.target.value)} placeholder="Present or End Date" />
               </div>
               <Textarea label="Description" value={work.description} onChange={e => handleNestedChange<WorkExperience>('workExperience', index, 'description', e.target.value)} />
               <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="ai" onClick={() => handleSuggestDescription(work.id, work.jobTitle, index)} disabled={!work.jobTitle || !jobDescription} loading={aiLoading[work.id]}>
                    <Icon name="sparkle" /> Suggest Description
                </Button>
                <Button variant="secondary" onClick={() => handleEnhanceDescription(work.id, work.jobTitle, work.description, index)} disabled={!work.description} loading={aiLoading[`enhance-${work.id}`]}>
                    <Icon name="sparkle" /> AI Enhance
                </Button>
               </div>
            </div>
          ))
        ) : (
            <EmptyState title="No Experience Added" message="Showcase your professional journey by adding your work roles.">
                <Button variant="secondary" onClick={() => addListItem<WorkExperience>('workExperience', { id: `work-${Date.now()}`, jobTitle: '', company: '', startDate: '', endDate: 'Present', description: '' })}><Icon name="plus" className="mr-2" /> Add Experience</Button>
            </EmptyState>
        )}
        {cvData.workExperience.length > 0 && <Button variant="secondary" onClick={() => addListItem<WorkExperience>('workExperience', { id: `work-${Date.now()}`, jobTitle: '', company: '', startDate: '', endDate: 'Present', description: '' })}><Icon name="plus" className="mr-2" /> Add Another Experience</Button>}
      </Section>
    ),
    education: () => (
      <Section title="Education">
        {cvData.education.length > 0 ? (
          cvData.education.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-[var(--border-primary)] rounded-lg space-y-4 animate-fade-in-slide-down">
               <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[var(--text-secondary)]">Education #{index + 1}</h3>
                  <Button variant="ghost" className="!p-2 text-red-500 hover:bg-red-100" onClick={() => removeListItem('education', edu.id)}><Icon name="trash" /></Button>
               </div>
               <Input label="Degree / Certificate" value={edu.degree} onChange={e => handleNestedChange<Education>('education', index, 'degree', e.target.value)} />
               <Input label="University / Institution" value={edu.university} onChange={e => handleNestedChange<Education>('education', index, 'university', e.target.value)} />
               <Input label="Graduation Year" value={edu.graduationYear} onChange={e => handleNestedChange<Education>('education', index, 'graduationYear', e.target.value)} />
            </div>
          ))
        ) : (
            <EmptyState title="No Education Added" message="List your degrees and qualifications to build a strong profile.">
                 <Button variant="secondary" onClick={() => addListItem<Education>('education', { id: `edu-${Date.now()}`, degree: '', university: '', graduationYear: '' })}><Icon name="plus" className="mr-2" /> Add Education</Button>
            </EmptyState>
        )}
        {cvData.education.length > 0 && <Button variant="secondary" onClick={() => addListItem<Education>('education', { id: `edu-${Date.now()}`, degree: '', university: '', graduationYear: '' })}><Icon name="plus" className="mr-2" /> Add Another Education</Button>}
      </Section>
    ),
    skills: () => (
        <Section title="Skills">
            <Textarea label="Skills (comma-separated)" value={cvData.skills} onChange={(e) => handleFieldChange('skills', e.target.value)} rows={3} />
        </Section>
    ),
    projects: () => (
      <Section title="Projects">
        {cvData.projects.length > 0 ? (
          cvData.projects.map((project, index) => (
            <div key={project.id} className="p-4 border border-[var(--border-primary)] rounded-lg space-y-4 animate-fade-in-slide-down">
               <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[var(--text-secondary)]">Project #{index + 1}</h3>
                  <Button variant="ghost" className="!p-2 text-red-500 hover:bg-red-100" onClick={() => removeListItem('projects', project.id)}><Icon name="trash" /></Button>
               </div>
               <Input label="Project Name" value={project.name} onChange={e => handleNestedChange<Project>('projects', index, 'name', e.target.value)} />
               <Input label="Project Link (Optional)" value={project.link} onChange={e => handleNestedChange<Project>('projects', index, 'link', e.target.value)} />
               <Textarea label="Description" value={project.description} onChange={e => handleNestedChange<Project>('projects', index, 'description', e.target.value)} rows={3} />
            </div>
          ))
        ) : (
            <EmptyState title="No Projects Added" message="Add personal or professional projects to impress employers.">
                <Button variant="secondary" onClick={() => addListItem<Project>('projects', { id: `proj-${Date.now()}`, name: '', description: '', link: '' })}><Icon name="plus" className="mr-2" /> Add Project</Button>
            </EmptyState>
        )}
         {cvData.projects.length > 0 && <Button variant="secondary" onClick={() => addListItem<Project>('projects', { id: `proj-${Date.now()}`, name: '', description: '', link: '' })}><Icon name="plus" className="mr-2" /> Add Another Project</Button>}
      </Section>
    ),
    certifications: () => (
       <Section title="Certifications">
        {cvData.certifications.length > 0 ? (
          cvData.certifications.map((cert, index) => (
            <div key={cert.id} className="p-4 border border-[var(--border-primary)] rounded-lg space-y-4 animate-fade-in-slide-down">
               <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[var(--text-secondary)]">Certification #{index + 1}</h3>
                  <Button variant="ghost" className="!p-2 text-red-500 hover:bg-red-100" onClick={() => removeListItem('certifications', cert.id)}><Icon name="trash" /></Button>
               </div>
               <Input label="Certification Name" value={cert.name} onChange={e => handleNestedChange<Certification>('certifications', index, 'name', e.target.value)} />
               <Input label="Issuing Body" value={cert.issuingBody} onChange={e => handleNestedChange<Certification>('certifications', index, 'issuingBody', e.target.value)} />
               <Input label="Year" value={cert.year} onChange={e => handleNestedChange<Certification>('certifications', index, 'year', e.target.value)} />
            </div>
          ))
        ) : (
            <EmptyState title="No Certifications Added" message="List any relevant certifications you have earned.">
                <Button variant="secondary" onClick={() => addListItem<Certification>('certifications', { id: `cert-${Date.now()}`, name: '', issuingBody: '', year: '' })}><Icon name="plus" className="mr-2" /> Add Certification</Button>
            </EmptyState>
        )}
        {cvData.certifications.length > 0 && <Button variant="secondary" onClick={() => addListItem<Certification>('certifications', { id: `cert-${Date.now()}`, name: '', issuingBody: '', year: '' })}><Icon name="plus" className="mr-2" /> Add Another Certification</Button>}
      </Section>
    ),
    languages: () => (
       <Section title="Languages">
        {cvData.languages.length > 0 ? (
            cvData.languages.map((lang, index) => (
              <div key={index} className="flex items-center space-x-2 animate-fade-in-slide-down">
                 <div className="flex-grow"><Input label={`Language #${index + 1}`} value={lang} onChange={e => handleListChange('languages', index, e.target.value)} /></div>
                 <Button variant="ghost" className="!p-2 text-red-500 hover:bg-red-100" onClick={() => removeLanguageItem(index)}><Icon name="trash" /></Button>
              </div>
            ))
        ) : (
             <EmptyState title="No Languages Added" message="Add the languages you are proficient in.">
                <Button variant="secondary" onClick={() => onDataChange({...cvData, languages: [...cvData.languages, '']})}><Icon name="plus" className="mr-2" /> Add Language</Button>
            </EmptyState>
        )}
        {cvData.languages.length > 0 && <Button variant="secondary" onClick={() => onDataChange({...cvData, languages: [...cvData.languages, '']})}><Icon name="plus" className="mr-2" /> Add Another Language</Button>}
      </Section>
    ),
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 overflow-y-auto h-full">
      <div className="p-6 rounded-lg mb-6" style={{
        backgroundColor: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-primary)',
      }}>
        <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ borderColor: 'var(--border-primary)' }}>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Controls</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="!p-2" onClick={onToggleTheme}>
              <Icon name={cvData.theme === 'light' ? 'moon' : 'sun'} />
            </Button>
            <div id="tour-step-3">
                <Button variant="ghost" className="!p-2" onClick={onOpenCommandPalette} title="Open Command Palette (Ctrl+K)">
                  <Icon name="palette" />
                </Button>
            </div>
          </div>
        </div>
      </div>

      <Section title="Design & Customization">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.values(TemplateName).map(template => (
                <button 
                  key={template} 
                  onClick={() => onTemplateChange(template)} 
                  className={`p-4 border-2 rounded-lg text-center text-sm font-semibold transition-all ${activeTemplate === template ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5' : 'border-[var(--border-primary)] hover:border-[var(--text-secondary)]'}`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="accentColor" className="text-sm font-medium text-[var(--text-primary)]">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="accentColor"
                value={cvData.accentColor}
                onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                className="w-8 h-8 p-0 border-none cursor-pointer rounded bg-transparent"
              />
              <div className="w-28">
                  <Input
                    label="Hex"
                    value={cvData.accentColor}
                    onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                  />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="fontFamily" className="text-sm font-medium text-[var(--text-primary)] block mb-2">Font Family</label>
            <select 
              id="fontFamily" 
              value={cvData.fontFamily} 
              onChange={(e) => handleFieldChange('fontFamily', e.target.value)}
              className="block w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] sm:text-sm"
            >
              {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">Layout Density</label>
            <div className="flex rounded-md shadow-sm">
              {DENSITY_OPTIONS.map((density, idx) => (
                  <button 
                      key={density} 
                      onClick={() => handleFieldChange('layoutDensity', density)}
                      className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-[var(--border-primary)] transition-colors focus:z-10 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]
                          ${idx === 0 ? 'rounded-l-md' : ''}
                          ${idx === DENSITY_OPTIONS.length - 1 ? 'rounded-r-md' : '-ml-px'}
                          ${cvData.layoutDensity === density ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)] hover:bg-[var(--border-primary)]'}`}
                  >
                      {density}
                  </button>
              ))}
            </div>
          </div>

        </div>
      </Section>
      
      <div id="tour-step-1">
        <Section title="Target Job Description">
            <Textarea 
                label="Paste job description here"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={8}
                placeholder="e.g., Senior React Developer at TechCorp..."
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">All AI generation features will use this description as their primary context.</p>
        </Section>
      </div>

      <Section title="AI Tailoring Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div id="tour-step-2">
                <Button variant="ai" onClick={handleGenerateSummary} loading={aiLoading['summary']} disabled={!jobDescription} className="w-full">
                    <Icon name="sparkle" /> Tailor Summary
                </Button>
            </div>
            <Button variant="ai" onClick={handleSuggestSkills} disabled={!jobDescription} loading={aiLoading['skills']} className="w-full">
                <Icon name="sparkle" /> Suggest Skills
            </Button>
            <div id="tour-cover-letter">
                 <Button onClick={() => onGenerateCoverLetter(jobDescription)} variant="ai" className="w-full" disabled={!jobDescription}>
                    <Icon name="sparkle" /> Cover Letter
                </Button>
            </div>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">These actions use the job description above to tailor your CV.</p>
      </Section>

      <Section title="Personal Details">
        <Input label="Full Name" value={cvData.fullName} onChange={(e) => handleFieldChange('fullName', e.target.value)} />
        <Input label="Email" type="email" value={cvData.email} onChange={(e) => handleFieldChange('email', e.target.value)} />
        <Input label="Phone" type="tel" value={cvData.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} />
        <Input label="Address" value={cvData.address} onChange={(e) => handleFieldChange('address', e.target.value)} />
        <Input label="LinkedIn URL" value={cvData.linkedIn} onChange={(e) => handleFieldChange('linkedIn', e.target.value)} />
      </Section>
      
      {cvData.sectionOrder.map((key, index) => (
        <div key={key} className="relative">
            {sectionRenderers[key]()}
            {renderSectionControls(key, index)}
        </div>
      ))}
      
      {availableSectionsToAdd.length > 0 && (
         <Section title="Add New Section">
            <div className="flex flex-wrap gap-2">
            {availableSectionsToAdd.map(s => (
                <Button key={s.key} variant="secondary" onClick={() => addSection(s.key)}>
                    <Icon name="plus" className="mr-2" /> {s.name}
                </Button>
            ))}
            </div>
        </Section>
      )}

      <FeedbackTips cvData={cvData} jobDescription={jobDescription} />
    </div>
  );
};