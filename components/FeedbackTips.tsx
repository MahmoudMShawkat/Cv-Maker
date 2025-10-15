import React, { useState, useMemo, useEffect } from 'react';
import { type CvData, type AtsResult } from '../types';
import { analyzeCv } from '../services/geminiService';
import { Button } from './Button';
import { Icon } from './Icon';

interface FeedbackTipsProps {
  cvData: CvData;
  jobDescription: string;
}

const checkActionVerbs = (description: string): boolean => {
    const commonVerbs = ['managed', 'led', 'developed', 'created', 'implemented', 'optimized', 'achieved', 'drove', 'built', 'designed', 'spearheaded', 'streamlined', 'coordinated', 'engineered'];
    const firstWord = description.trim().split(' ')[0]?.toLowerCase().replace(/[•-]/g, '').trim();
    if (!firstWord) return true; // Ignore empty lines
    return commonVerbs.some(verb => firstWord.startsWith(verb));
}

const generateCvAsText = (data: CvData): string => {
    let text = `${data.fullName}\n${data.email} | ${data.phone} | ${data.address}\n\n`;
    data.sectionOrder.forEach(sectionKey => {
        switch(sectionKey) {
            case 'summary': text += `SUMMARY\n${data.summary}\n\n`; break;
            case 'workExperience':
                text += `WORK EXPERIENCE\n`;
                data.workExperience.forEach(w => { text += `${w.jobTitle} at ${w.company}\n${w.description}\n\n`; });
                break;
            case 'education':
                 text += `EDUCATION\n`;
                 data.education.forEach(e => { text += `${e.degree}, ${e.university}\n\n`; });
                break;
            case 'skills': text += `SKILLS\n${data.skills}\n\n`; break;
        }
    });
    return text;
};

const ProgressRing: React.FC<{score: number}> = ({ score }) => {
    const radius = 54;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const scoreColor = score > 75 ? 'var(--accent-primary)' : score > 50 ? '#89E219' : '#EF4444';

    return (
        <div className="relative w-36 h-36">
            <svg height="100%" width="100%" viewBox="0 0 120 120">
                <circle
                    stroke="#E5E7EB"
                    className="dark:stroke-gray-700"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius + stroke / 2}
                    cy={radius + stroke / 2}
                />
                <circle
                    className="progress-ring__circle"
                    stroke={scoreColor}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, strokeLinecap: 'round' }}
                    r={normalizedRadius}
                    cx={radius + stroke/2}
                    cy={radius + stroke/2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold" style={{color: scoreColor}}>
                {score}<span className="text-xl">%</span>
            </div>
        </div>
    );
}

export const FeedbackTips: React.FC<FeedbackTipsProps> = ({ cvData, jobDescription }) => {
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const ruleBasedTips: string[] = useMemo(() => {
    const tips: string[] = [];
    if (cvData.summary.split(' ').length > 120) {
        tips.push("Your summary is a bit long. Aim for 3-4 concise sentences.");
    }
    const descriptionsWithoutActionVerbs = cvData.workExperience
        .flatMap(work => work.description.split('\n'))
        .filter(line => line.trim().length > 5 && !checkActionVerbs(line))
        .length;
    if (descriptionsWithoutActionVerbs > 0) {
        tips.push("Start work experience bullet points with strong action verbs (e.g., 'Managed', 'Developed').");
    }
    const skillCount = cvData.skills.split(',').filter(s => s.trim()).length;
    if (skillCount > 0 && skillCount < 5) {
        tips.push("Consider listing at least 5-10 key skills.");
    }
    return tips;
  }, [cvData]);

  const handleAnalyzeCv = async () => {
    setLoading(true);
    setAtsResult(null);
    try {
        const cvText = generateCvAsText(cvData);
        const result = await analyzeCv(cvText, jobDescription);
        setAtsResult(result);
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg mt-6" style={{
        backgroundColor: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-primary)',
    }}>
      <h2 className="text-xl font-semibold border-b pb-4 mb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}>ATS Analysis & Feedback</h2>
      <div id="tour-step-4">
        <Button onClick={handleAnalyzeCv} disabled={!jobDescription} loading={loading} variant="ai">
            <Icon name="sparkle" />
            Analyze CV Against Job Description
        </Button>
      </div>

      {atsResult && (
          <div className="mt-4 space-y-4 animate-fade-in-slide-down">
              {atsResult.matchScore > 85 && (
                <div className="flex flex-col items-center text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg my-4">
                    <svg className="w-16 h-16 text-[var(--accent-primary)] mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h4 className="font-bold text-lg text-[var(--accent-primary)]">Excellent Match!</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Your CV is highly aligned with this job. Great work!</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                 <ProgressRing score={atsResult.matchScore} />
                 <p className="text-sm text-[var(--text-secondary)] flex-1 text-center sm:text-left">This score estimates how well your CV aligns with the job description's keywords and requirements.</p>
              </div>
              <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                      {atsResult.missingKeywords.length > 0 ? atsResult.missingKeywords.map((kw, i) => (
                          <span key={i} className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">{kw}</span>
                      )) : <p className="text-sm text-[var(--text-secondary)]">No critical keywords seem to be missing. Great job!</p>}
                  </div>
              </div>
               <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">AI Improvement Tips</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-[var(--text-secondary)] mt-2">
                      {atsResult.improvementTips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
              </div>
          </div>
      )}
      
      {ruleBasedTips.length > 0 && !atsResult && (
          <div className="mt-4 pt-4 border-t" style={{borderColor: 'var(--border-primary)'}}>
               <h3 className="font-semibold text-[var(--text-primary)]">General CV Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-[var(--text-secondary)] mt-2">
                    {ruleBasedTips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
          </div>
      )}
    </div>
  );
};