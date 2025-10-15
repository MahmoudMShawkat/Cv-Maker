import React, { useState, useEffect, useRef } from 'react';
import { CvForm } from './components/CvForm';
import { CvPreview } from './components/CvPreview';
import { type CvData, TemplateName, WorkExperience, Education, Theme } from './types';
import { INITIAL_CV_DATA, LOCAL_STORAGE_KEY } from './constants';
import { generateCoverLetter } from './services/geminiService';
import { Button } from './components/Button';
// FIX: Import IconProps to use for type assertion.
import { Icon, type IconProps } from './components/Icon';
import { Textarea } from './components/Textarea';
import { OnboardingTour } from './components/OnboardingTour';
import { CommandPalette } from './components/CommandPalette';

const generateCvAsText = (data: CvData): string => {
    let text = `${data.fullName}\n${data.email} | ${data.phone} | ${data.address}\n\n`;
    text += `SUMMARY\n${data.summary}\n\n`;
    text += `WORK EXPERIENCE\n`;
    data.workExperience.forEach(w => {
        text += `${w.jobTitle} at ${w.company} (${w.startDate} - ${w.endDate})\n${w.description}\n\n`;
    });
    text += `EDUCATION\n`;
    data.education.forEach(e => {
        text += `${e.degree}, ${e.university} (${e.graduationYear})\n\n`;
    });
    text += `SKILLS\n${data.skills}\n\n`;
    if (data.projects.length > 0) {
        text += `PROJECTS\n`;
        data.projects.forEach(p => { text += `${p.name}: ${p.description}\n` });
        text += '\n';
    }
    return text;
};

const parseLinkedInText = (text: string): { experience: Partial<WorkExperience>[], education: Partial<Education>[] } => {
    // This is a very basic parser and may not cover all LinkedIn formats.
    const experience: Partial<WorkExperience>[] = [];
    const education: Partial<Education>[] = [];
    
    // Simple parsing logic, can be improved with more complex regex
    text.split('\n\n').forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length >= 3) {
            if (lines[1].toLowerCase().includes(' at ')) { // Likely experience
                experience.push({
                    id: `work-${Date.now()}-${Math.random()}`,
                    jobTitle: lines[0],
                    company: lines[1].split(' at ')[1],
                    description: lines.slice(3).join('\n')
                });
            } else { // Likely education
                education.push({
                    id: `edu-${Date.now()}-${Math.random()}`,
                    university: lines[0],
                    degree: lines[1],
                    graduationYear: lines[2]
                });
            }
        }
    });
    return { experience, education };
}

const App: React.FC = () => {
  const [cvData, setCvData] = useState<CvData>(INITIAL_CV_DATA);
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>(TemplateName.Modern);
  const previewRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // New features state
  const [isCoverLetterOpen, setCoverLetterOpen] = useState(false);
  const [isImporterOpen, setImporterOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  
  // Load data and check for first visit
  useEffect(() => {
    try {
      const firstVisit = !localStorage.getItem('hasVisited');
      if (firstVisit) {
        setShowOnboarding(true);
        localStorage.setItem('hasVisited', 'true');
      }

      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      if (dataParam) {
        const decodedData = JSON.parse(decodeURIComponent(atob(dataParam)));
        setCvData(decodedData);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) setCvData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to parse data:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setCvData(INITIAL_CV_DATA);
    }
  }, []);

  // Save data & manage theme
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));
      // Apply theme
      if (cvData.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error("Failed to save data or apply theme:", error);
    }
  }, [cvData]);

  // Command Palette listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleToggleTheme = () => {
    setCvData(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }

  const handleDownloadPdf = () => {
    const element = previewRef.current;
    if (!element) return;
    const opt = {
      margin: 0.5,
      filename: `${cvData.fullName.replace(/\s+/g, '_')}_CV.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: cvData.theme === 'dark' && activeTemplate === TemplateName.Creative ? '#1F2937' : '#FFFFFF' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().from(element).set(opt).save();
  };

  const handleDownloadDocx = async () => {
    const element = previewRef.current;
    if (!element) return;
    try { // @ts-ignore
        const fileBuffer = await htmlToDocx.asBlob(element.innerHTML);
        const url = URL.createObjectURL(fileBuffer);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cvData.fullName.replace(/\s+/g, '_')}_CV.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        alert("Failed to generate DOCX file.");
    }
  };

  const handleDownloadTxt = () => {
    const text = generateCvAsText(cvData);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cvData.fullName.replace(/\s+/g, '_')}_CV.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleShare = () => {
    try {
        const dataStr = btoa(encodeURIComponent(JSON.stringify(cvData)));
        const url = `${window.location.origin}${window.location.pathname}?data=${dataStr}`;
        navigator.clipboard.writeText(url);
        alert("Shareable link copied to clipboard!");
    } catch (e) {
        alert("Failed to generate shareable link.");
    }
  };

  const handleGenerateCoverLetter = async (jobDescription: string) => {
    setCoverLetterOpen(true);
    setCoverLetterLoading(true);
    setCoverLetterContent('');
    try {
        const content = await generateCoverLetter(cvData, jobDescription);
        setCoverLetterContent(content);
    } catch (error) {
        setCoverLetterContent(`Error: ${(error as Error).message}`);
    } finally {
        setCoverLetterLoading(false);
    }
  };

  const handleImportData = (text: string) => {
      try {
          const { experience, education } = parseLinkedInText(text);
          setCvData(prev => ({
              ...prev,
              workExperience: [...prev.workExperience, ...experience as WorkExperience[]],
              education: [...prev.education, ...education as Education[]]
          }));
          setImporterOpen(false);
      } catch (error) {
          alert("Could not parse the provided text.");
      }
  }

  const Modal: React.FC<{children: React.ReactNode, title: string, onClose: () => void}> = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{backgroundColor: 'var(--bg-secondary)'}}>
            <div className="flex justify-between items-center p-4 border-b" style={{borderColor: 'var(--border-primary)'}}>
                <h2 className="text-xl font-bold">{title}</h2>
                <Button onClick={onClose} variant="ghost" className="!p-2">X</Button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
  );

  const CoverLetterModal = () => (
    <Modal title="AI Generated Cover Letter" onClose={() => setCoverLetterOpen(false)}>
        {coverLetterLoading && <div className="flex items-center justify-center h-64"><Icon name="loader" className="w-12 h-12" /></div>}
        {coverLetterContent && (
            <div>
                <Textarea value={coverLetterContent} onChange={(e) => setCoverLetterContent(e.target.value)} rows={15} label="Your cover letter" />
                <Button onClick={() => navigator.clipboard.writeText(coverLetterContent)} className="mt-4"><Icon name="clipboard" className="mr-2"/> Copy to Clipboard</Button>
            </div>
        )}
    </Modal>
  );
  
  const DataImporterModal = () => {
      const [importText, setImportText] = useState('');
      return (
        <Modal title="Import from LinkedIn" onClose={() => setImporterOpen(false)}>
            <p className="mb-2 text-sm text-[var(--text-secondary)]">Copy text from your LinkedIn profile's Experience/Education sections.</p>
            <Textarea value={importText} onChange={e => setImportText(e.target.value)} rows={15} label="Paste text here" />
            <Button onClick={() => handleImportData(importText)} disabled={!importText} className="mt-4">Parse and Import</Button>
        </Modal>
      )
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 pb-16 lg:pb-0">
        <div className={`col-span-1 h-screen overflow-y-scroll ${mobileView === 'preview' ? 'hidden' : ''} lg:block`}>
          <CvForm 
            cvData={cvData} 
            onDataChange={setCvData} 
            activeTemplate={activeTemplate}
            onTemplateChange={setActiveTemplate}
            onDownloadPdf={handleDownloadPdf}
            onDownloadDocx={handleDownloadDocx}
            onDownloadTxt={handleDownloadTxt}
            onShare={handleShare}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            onImportData={() => setImporterOpen(true)}
            onToggleTheme={handleToggleTheme}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />
        </div>
        <div className={`lg:flex col-span-1 h-screen overflow-y-scroll items-start justify-center p-4 lg:p-8 ${mobileView === 'editor' ? 'hidden' : 'flex'}`} style={{backgroundColor: 'var(--bg-primary)'}}>
          <div className="w-full max-w-4xl lg:aspect-[8.5/11]">
              <CvPreview cvData={cvData} template={activeTemplate} previewRef={previewRef} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] shadow-[0_-2px_5px_rgba(0,0,0,0.1)] z-40 p-2 flex justify-around border-t border-[var(--border-primary)]">
        <Button 
          variant={mobileView === 'editor' ? 'primary' : 'ghost'} 
          onClick={() => setMobileView('editor')}
          className="w-1/2"
        >
          Editor
        </Button>
        <Button 
          variant={mobileView === 'preview' ? 'primary' : 'ghost'} 
          onClick={() => setMobileView('preview')}
          className="w-1/2"
        >
          Preview
        </Button>
      </div>

      {isCoverLetterOpen && <CoverLetterModal />}
      {isImporterOpen && <DataImporterModal />}
      {showOnboarding && <OnboardingTour onClose={() => setShowOnboarding(false)} />}
      {isCommandPaletteOpen && (
          <CommandPalette 
            onClose={() => setCommandPaletteOpen(false)} 
            commands={[
                { id: 'toggle-theme', title: 'Toggle Theme', icon: 'moon', action: handleToggleTheme },
                { id: 'download-pdf', title: 'Download as PDF', icon: 'download', action: handleDownloadPdf },
                { id: 'download-docx', title: 'Download as DOCX', icon: 'file-word', action: handleDownloadDocx },
                { id: 'import-data', title: 'Import LinkedIn Data', icon: 'clipboard', action: () => setImporterOpen(true) },
                // FIX: Cast icon to IconProps['name'] to satisfy TypeScript
                ...Object.values(TemplateName).map(t => ({ id: `template-${t}`, title: `Set Template: ${t}`, icon: 'palette' as IconProps['name'], action: () => setActiveTemplate(t) }))
            ]}
          />
      )}
    </>
  );
};

export default App;
