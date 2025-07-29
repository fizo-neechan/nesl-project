
// src/components/ui/ErrorMessage.tsx

export interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  variant = 'error',
  className = ''
}) => {
  const variantConfig = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
      icon: '⚠️'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
      icon: '⚠️'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
      icon: 'ℹ️'
    }
  };

  const config = variantConfig[variant];

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className={`${config.iconColor} text-lg`}>{config.icon}</span>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${config.textColor}`}>{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md ${config.bgColor} ${config.textColor} hover:${config.textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${variant}-50`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
