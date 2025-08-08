import React from 'react';

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  loadingText?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  loadingText,
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-primary hover:bg-green-600 focus:ring-primary text-white`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white`;
      case 'outline':
        return `${baseClasses} bg-transparent border-2 border-primary hover:bg-primary/10 focus:ring-primary text-primary`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getDisabledClasses = () => {
    if (disabled || loading) {
      return 'opacity-50 cursor-not-allowed';
    }
    return '';
  };

  const Spinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getDisabledClasses()}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner />
          <span>{loadingText || children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
