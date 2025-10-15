import React from 'react';
import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ai' | 'ghost';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, loading = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95";
  
  const variantClasses = {
    primary: 'border-transparent text-white bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-primary-darker)] hover:brightness-110 focus:ring-[var(--accent-primary)]',
    secondary: 'border-[var(--border-primary)] text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-opacity-80 focus:ring-[var(--accent-primary)]',
    danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
    ai: 'border-transparent text-white bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-primary-darker)] hover:brightness-110 focus:ring-[var(--accent-primary)] gap-2',
    ghost: 'border-transparent text-[var(--text-secondary)] bg-transparent hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)] focus:ring-[var(--accent-primary)] shadow-none',
  };

  const isDisabled = props.disabled || loading;

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props} disabled={isDisabled}>
      {loading && <Icon name="loader" className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};