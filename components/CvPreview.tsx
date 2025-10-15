import React from 'react';
import { type CvData, TemplateName } from '../types';
import { TEMPLATES, DENSITY_STYLES } from '../constants';

interface CvPreviewProps {
  cvData: CvData;
  template: TemplateName;
  previewRef: React.RefObject<HTMLDivElement>;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Add a day to counteract timezone issues that might push it to the previous day
        date.setDate(date.getDate() + 1);
        // FIX: Corrected method name from toLocaleDateFormat to toLocaleDateString
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch (e) {
        return dateString;
    }
}

export const CvPreview: React.FC<CvPreviewProps> = ({ cvData, template, previewRef }) => {
  const styles = TEMPLATES[template];
  const density = DENSITY_STYLES[cvData.layoutDensity || 'Standard'];
  
  const renderSection = (sectionKey: string) => {
    switch(sectionKey) {
        case 'summary':
            return cvData.summary && (
                <section key="summary" className={density.section}>
                    <h2 className={styles.sectionTitle}>Summary</h2>
                    <p className={styles.content}>{cvData.summary}</p>
                </section>
            );
        case 'workExperience':
            return cvData.workExperience.length > 0 && (
                <section key="workExperience" className={density.section}>
                    <h2 className={styles.sectionTitle}>Work Experience</h2>
                    {cvData.workExperience.map(work => (
                        <div key={work.id} className={density.item}>
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-lg">{work.jobTitle || 'Job Title'}</h3>
                            <p className="text-sm font-light">{formatDate(work.startDate)} - {work.endDate === 'Present' ? 'Present' : formatDate(work.endDate)}</p>
                        </div>
                        <h4 className="italic text-md">{work.company || 'Company'}</h4>
                        <p className={`${styles.content} whitespace-pre-wrap mt-2`}>{work.description}</p>
                        </div>
                    ))}
                </section>
            );
        case 'education':
            return cvData.education.length > 0 && (
                <section key="education" className={density.section}>
                    <h2 className={styles.sectionTitle}>Education</h2>
                    {cvData.education.map(edu => (
                        <div key={edu.id} className={density.item}>
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-lg">{edu.degree || 'Degree'}</h3>
                            <p className="text-sm font-light">{edu.graduationYear}</p>
                        </div>
                        <h4 className="italic text-md">{edu.university || 'University'}</h4>
                        </div>
                    ))}
                </section>
            );
        case 'skills':
            return cvData.skills && (
                <section key="skills" className={density.section}>
                    <h2 className={styles.sectionTitle}>Skills</h2>
                    <p className={styles.content}>{cvData.skills}</p>
                </section>
            );
        case 'projects':
            return cvData.projects.length > 0 && (
                <section key="projects" className={density.section}>
                    <h2 className={styles.sectionTitle}>Projects</h2>
                    {cvData.projects.map(project => (
                        <div key={project.id} className={density.item}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-lg">{project.name || 'Project Name'}</h3>
                                {project.link && <a href={project.link.startsWith('http') ? project.link : `//${project.link}`} target="_blank" rel="noopener noreferrer" className="text-sm font-light hover:underline" style={{color: cvData.accentColor}}>Link</a>}
                            </div>
                            <p className={`${styles.content} whitespace-pre-wrap mt-1`}>{project.description}</p>
                        </div>
                    ))}
                </section>
            );
        case 'certifications':
            return cvData.certifications.length > 0 && (
                <section key="certifications" className={density.section}>
                    <h2 className={styles.sectionTitle}>Certifications</h2>
                    {cvData.certifications.map(cert => (
                        <div key={cert.id} className={density.item}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-lg">{cert.name || 'Certification Name'}</h3>
                                <p className="text-sm font-light">{cert.year}</p>
                            </div>
                            <h4 className="italic text-md">{cert.issuingBody || 'Issuing Body'}</h4>
                        </div>
                    ))}
                </section>
            );
        case 'languages':
            return cvData.languages.length > 0 && (
                <section key="languages" className={density.section}>
                    <h2 className={styles.sectionTitle}>Languages</h2>
                    <p className={styles.content}>{cvData.languages.join(', ')}</p>
                </section>
            );
        default:
            return null;
    }
  }
  
  const isCreativeTemplate = template === TemplateName.Creative;
  const isClassicTemplate = template === TemplateName.Classic;
  const font = isClassicTemplate ? "'Merriweather', serif" : `'${cvData.fontFamily}', sans-serif`;


  return (
    <div 
        ref={previewRef} 
        className={`${styles.preview} transition-all duration-300`}
        style={{ 
          '--accent-color': cvData.accentColor, 
          fontFamily: font,
          backgroundColor: isCreativeTemplate ? 'var(--bg-secondary)' : '#FFFFFF', // Override for creative dark
          color: isCreativeTemplate ? 'var(--text-primary)' : '#1F2937',
        } as React.CSSProperties}
    >
      <header className={styles.header}>
        <div>
          <h1 className={styles.name}>{cvData.fullName || 'Your Name'}</h1>
        </div>
        <div className={styles.contactInfo}>
          <p><a href={`mailto:${cvData.email}`} style={{color: 'inherit'}}>{cvData.email}</a></p>
          <p>{cvData.phone}</p>
          <p>{cvData.address}</p>
          {cvData.linkedIn && <p><a href={cvData.linkedIn.startsWith('http') ? cvData.linkedIn : `//${cvData.linkedIn}`} target="_blank" rel="noopener noreferrer" style={{color: cvData.accentColor}}>LinkedIn</a></p>}
        </div>
      </header>

      <main className="mt-2">
        {cvData.sectionOrder.map(renderSection)}
      </main>
    </div>
  );
};