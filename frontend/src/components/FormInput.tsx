import React, { useState, useEffect } from 'react';
import { ValidationError } from '../types/auth';

interface FormInputProps {
  type: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  name: string;
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  autoComplete,
  name,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  useEffect(() => {
    if (error) {
      setShowError(true);
    } else {
      // Delay hiding error to show smooth transition
      const timer = setTimeout(() => setShowError(false), 300);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowError(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(value);
    }
    if (error) {
      setShowError(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (error) {
      setShowError(false);
    }
  };

  const getInputClasses = () => {
    const baseClasses = `
      w-full px-4 py-3 bg-input/50 border rounded-lg text-white placeholder-slate-400 
      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
      transition-all duration-300 ease-in-out
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    if (error && showError) {
      return `${baseClasses} border-red-500 focus:ring-red-500`;
    }

    if (isFocused) {
      return `${baseClasses} border-primary`;
    }

    return `${baseClasses} border-input`;
  };

  const getLabelClasses = () => {
    const baseClasses = `
      absolute left-4 transition-all duration-300 ease-in-out pointer-events-none
      ${isFocused || hasValue ? 'text-xs text-primary -top-2 bg-background px-2' : 'text-base text-slate-400'}
    `;

    if (error && showError) {
      return `${baseClasses} text-red-400`;
    }

    return baseClasses;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={getInputClasses()}
        />
        
        {/* Floating Label */}
        {(isFocused || hasValue) && (
          <label className={getLabelClasses()}>
            {placeholder}
          </label>
        )}
      </div>

      {/* Error Message */}
      {error && showError && (
        <div className="mt-2 animate-fadeIn">
          <p className="text-red-400 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Success Indicator */}
      {hasValue && !error && !isFocused && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default FormInput;
