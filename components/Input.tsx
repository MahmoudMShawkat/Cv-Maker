import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="floating-label-group">
      <input
        {...props}
        placeholder=" "
        className="floating-input block w-full px-4 pt-6 pb-2 bg-transparent border border-[var(--border-primary)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] sm:text-sm"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      />
      <label className="floating-label">{label}</label>
    </div>
  );
};