// src/components/ui/Button.tsx
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500 shadow-md hover:shadow-lg',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 shadow-md hover:shadow-lg',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-500 shadow-md hover:shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const loadingClasses = 'cursor-wait';
  const fullWidthClasses = fullWidth ? 'w-full' : '';

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidthClasses,
    (disabled || loading) ? disabledClasses : '',
    loading ? loadingClasses : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
