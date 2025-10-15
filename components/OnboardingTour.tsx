import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  onClose: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '#tour-step-1',
    title: 'Start Here: The Job Description',
    content: 'Paste the job description you are targeting into this box. This is the key to unlocking the AI tailoring features.',
    position: 'bottom',
  },
  {
    selector: '#tour-step-2',
    title: 'AI-Powered Tailoring',
    content: 'After pasting a job description, use these buttons to automatically generate content that is tailored specifically for that role.',
    position: 'bottom',
  },
  {
    selector: '#tour-step-3',
    title: 'Customize Your Design',
    content: 'Choose from different templates, fonts, and colors to create a unique look for your CV.',
    position: 'left',
  },
  {
    selector: '#tour-step-4',
    title: 'Analyze & Export',
    content: 'Check your CVs compatibility with automated systems (ATS) and download it in multiple formats when you are ready.',
    position: 'left',
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = useMemo(() => TOUR_STEPS[stepIndex], [stepIndex]);

  useEffect(() => {
    const targetElement = document.querySelector(currentStep.selector);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Timeout to allow for scrolling
      setTimeout(() => {
        setTargetRect(targetElement.getBoundingClientRect());
      }, 300);
    }
  }, [currentStep]);

  if (!targetRect) {
    return null; // Don't render until we have a target
  }

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: targetRect.bottom + 10,
    left: targetRect.left,
    width: 300,
    zIndex: 10001,
  };
  
  if (currentStep.position === 'top') {
    tooltipStyle.top = targetRect.top - 10;
    tooltipStyle.transform = 'translateY(-100%)';
  }
  if (currentStep.position === 'left') {
    tooltipStyle.left = targetRect.left - 10;
    tooltipStyle.top = targetRect.top;
    tooltipStyle.transform = 'translateX(-100%)';
  }

  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStepIndex(i => i + 1);
    }
  };
  
  const handlePrev = () => {
      setStepIndex(i => Math.max(0, i - 1));
  }

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70" onClick={onClose}></div>
      
      {/* Highlight Box */}
      <div 
        className="fixed border-2 border-dashed border-white rounded-lg transition-all duration-300" 
        style={{ 
            top: targetRect.top - 5, 
            left: targetRect.left - 5, 
            width: targetRect.width + 10, 
            height: targetRect.height + 10,
        }}
      ></div>

      {/* Tooltip */}
      {/* FIX: Removed duplicate style attribute */}
      <div className="p-4 rounded-lg shadow-xl animate-fade-in"
        style={{...tooltipStyle, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)'}}
      >
        <h3 className="font-bold text-lg mb-2">{currentStep.title}</h3>
        <p className="text-sm mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-secondary)]">{stepIndex + 1} / {TOUR_STEPS.length}</span>
          <div className="space-x-2">
            {stepIndex > 0 && <Button variant="secondary" onClick={handlePrev}>Back</Button>}
            <Button onClick={handleNext}>{isLastStep ? 'Finish' : 'Next'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};