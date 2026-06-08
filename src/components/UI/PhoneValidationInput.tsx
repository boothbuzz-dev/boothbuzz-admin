import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { validatePhone } from '../../utils/validation';

interface PhoneValidationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  allowInternational?: boolean;
}

export const PhoneValidationInput: React.FC<PhoneValidationInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Enter phone number',
  allowInternational = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const showValidation = hasInteracted || isFocused;

  const validationResult = validatePhone(value);
  const isError = validationResult && !validationResult.isValid;
  const isSuccess = validationResult && validationResult.isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Only allow digits, spaces, hyphens, parentheses, and plus sign
    if (allowInternational) {
      newValue = newValue.replace(/[^0-9\s\-\(\)\+]/g, '');
    } else {
      newValue = newValue.replace(/[^0-9\s\-\(\)]/g, '');
    }
    
    onChange(newValue);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getInputClasses = () => {
    let baseClasses = 'w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200';
    
    if (isError && showValidation) {
      baseClasses += ' border-red-300 bg-red-50';
    } else if (isSuccess && showValidation) {
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
    
    if (isError && showValidation) {
      baseClasses += ' text-red-700';
    } else if (isSuccess && showValidation) {
      baseClasses += ' text-green-700';
    } else {
      baseClasses += ' text-gray-700';
    }
    
    return baseClasses;
  };

  const getPhoneInfo = () => {
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
    const length = cleanPhone.length;
    
    if (length === 0) return null;
    
    if (length < 10) {
      return { status: 'error', message: `Too short (${length}/10 digits)` };
    } else if (length > 15) {
      return { status: 'error', message: `Too long (${length}/15 digits)` };
    } else if (length >= 10 && length <= 15) {
      return { status: 'success', message: `Valid length (${length} digits)` };
    }
    
    return null;
  };

  const phoneInfo = getPhoneInfo();

  return (
    <div className={className}>
      <label className={getLabelClasses()}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Phone className="h-4 w-4" />
        </div>
        
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClasses()}
          maxLength={20}
          pattern={allowInternational ? '[\+]?[0-9\s\-\(\)]{10,20}' : '[0-9\s\-\(\)]{10,20}'}
          title={allowInternational ? 'Phone number with optional + prefix' : 'Phone number'}
        />
        
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isError && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {isSuccess && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {isError && showValidation && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationResult.message}
        </p>
      )}
      
      {isSuccess && showValidation && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" />
          Valid phone number
        </p>
      )}
      
      {phoneInfo && (
        <p className={`mt-1 text-xs ${
          phoneInfo.status === 'error' ? 'text-red-500' : 'text-green-500'
        }`}>
          {phoneInfo.message}
        </p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        {allowInternational ? 'Format: +91 98765 43210 or 9876543210' : 'Format: 9876543210'}
      </p>
    </div>
  );
};
