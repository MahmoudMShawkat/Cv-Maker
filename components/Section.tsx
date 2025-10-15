import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="p-6 rounded-lg mb-6" style={{
      backgroundColor: 'var(--bg-secondary)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border-primary)',
    }}>
      <h2 className="text-xl font-semibold border-b pb-3 mb-4" style={{
        color: 'var(--text-primary)',
        borderColor: 'var(--border-primary)',
      }}>{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};