import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  title?: string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  required = false,
  error,
  success = false,
  disabled = false,
  className = '',
  icon,
  maxLength,
  minLength,
  pattern,
  title
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const showValidation = hasInteracted || isFocused;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const getInputClasses = () => {
    let baseClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200';
    
    if (icon) {
      baseClasses += ' pl-10';
    }
    
    if (error && showValidation) {
      baseClasses += ' border-red-300 bg-red-50';
    } else if (success && showValidation) {
      baseClasses += ' border-green-300 bg-green-50';
    } else if (isFocused) {
      baseClasses += ' border-blue-300';
    } else {
      baseClasses += ' border-gray-300';
    }
    
    if (disabled) {
      baseClasses += ' bg-gray-100 cursor-not-allowed';
    }
    
    return baseClasses;
  };

  const getLabelClasses = () => {
    let baseClasses = 'block text-sm font-medium mb-2';
    
    if (error && showValidation) {
      baseClasses += ' text-red-700';
    } else if (success && showValidation) {
      baseClasses += ' text-green-700';
    } else {
      baseClasses += ' text-gray-700';
    }
    
    return baseClasses;
  };

  return (
    <div className={className}>
      <label className={getLabelClasses()}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClasses()}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          title={title}
        />
        
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {success && !error && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {error && showValidation && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {success && !error && showValidation && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" />
          Valid
        </p>
      )}
      
      {maxLength && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};
