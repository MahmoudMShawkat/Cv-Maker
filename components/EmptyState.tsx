import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  children: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, children }) => {
  return (
    <div className="text-center p-8 border-2 border-dashed border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)]">
      <div className="flex justify-center mb-4">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--text-secondary)] opacity-50">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15.5C12.8284 15.5 13.5 14.8284 13.5 14C13.5 13.1716 12.8284 12.5 12 12.5C11.1716 12.5 10.5 13.1716 10.5 14C10.5 14.8284 11.1716 15.5 12 15.5Z" fill="currentColor"/>
          <path d="M12 12.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] mt-2 mb-4 max-w-xs mx-auto">{message}</p>
      {children}
    </div>
  );
};