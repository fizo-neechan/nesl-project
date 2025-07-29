
export interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showLabel = true,
  size = 'md'
}) => {
  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      textColor: 'text-green-800',
      bgColor: 'bg-green-100',
      defaultLabel: 'Connected',
      icon: '✓'
    },
    disconnected: {
      color: 'bg-red-500',
      textColor: 'text-red-800',
      bgColor: 'bg-red-100',
      defaultLabel: 'Disconnected',
      icon: '✕'
    },
    connecting: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      defaultLabel: 'Connecting',
      icon: '⟳'
    },
    error: {
      color: 'bg-red-600',
      textColor: 'text-red-900',
      bgColor: 'bg-red-100',
      defaultLabel: 'Error',
      icon: '!'
    }
  };

  const sizeConfig = {
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      padding: 'px-2 py-1'
    },
    md: {
      dot: 'w-3 h-3',
      text: 'text-sm',
      padding: 'px-3 py-1'
    },
    lg: {
      dot: 'w-4 h-4',
      text: 'text-base',
      padding: 'px-4 py-2'
    }
  };

  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];
  const displayLabel = label || config.defaultLabel;

  return (
    <div className={`flex items-center gap-2 ${sizeClasses.padding} ${config.bgColor} rounded-full ${sizeClasses.text} font-medium`}>
      <div className={`${sizeClasses.dot} ${config.color} rounded-full ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {showLabel && (
        <span className={config.textColor}>
          {displayLabel}
        </span>
      )}
    </div>
  );
};
