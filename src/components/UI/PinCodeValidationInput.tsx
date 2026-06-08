import React, { useState } from 'react';
import { AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { validatePinCode } from '../../utils/validation';

interface PinCodeValidationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  country?: 'IN' | 'US' | 'CA' | 'UK';
}

export const PinCodeValidationInput: React.FC<PinCodeValidationInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Enter pin code',
  country = 'IN'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const showValidation = hasInteracted || isFocused;

  const validationResult = validatePinCode(value);
  const isError = validationResult && !validationResult.isValid;
  const isSuccess = validationResult && validationResult.isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Only allow digits
    newValue = newValue.replace(/[^0-9]/g, '');
    
    // Apply country-specific length restrictions
    if (country === 'IN' && newValue.length > 6) {
      newValue = newValue.slice(0, 6);
    } else if (country === 'US' && newValue.length > 5) {
      newValue = newValue.slice(0, 5);
    } else if (country === 'CA' && newValue.length > 6) {
      newValue = newValue.slice(0, 6);
    } else if (country === 'UK' && newValue.length > 7) {
      newValue = newValue.slice(0, 7);
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

  const getPinCodeInfo = () => {
    if (value.length === 0) return null;
    
    const expectedLength = getExpectedLength();
    
    if (value.length < expectedLength) {
      return { status: 'warning', message: `Incomplete (${value.length}/${expectedLength} digits)` };
    } else if (value.length === expectedLength) {
      return { status: 'success', message: `Complete (${value.length} digits)` };
    }
    
    return null;
  };

  const getExpectedLength = () => {
    switch (country) {
      case 'IN': return 6;
      case 'US': return 5;
      case 'CA': return 6;
      case 'UK': return 7;
      default: return 6;
    }
  };

  const getPattern = () => {
    const length = getExpectedLength();
    return `[0-9]{${length}}`;
  };

  const getMaxLength = () => {
    return getExpectedLength();
  };

  const getTitle = () => {
    const length = getExpectedLength();
    return `Pin code must be exactly ${length} digits`;
  };

  const pinCodeInfo = getPinCodeInfo();

  return (
    <div className={className}>
      <label className={getLabelClasses()}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin className="h-4 w-4" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClasses()}
          pattern={getPattern()}
          title={getTitle()}
          maxLength={getMaxLength()}
          inputMode="numeric"
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
          Valid pin code
        </p>
      )}
      
      {pinCodeInfo && (
        <p className={`mt-1 text-xs ${
          pinCodeInfo.status === 'warning' ? 'text-yellow-500' : 'text-green-500'
        }`}>
          {pinCodeInfo.message}
        </p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        {country === 'IN' && 'Format: 6 digits (e.g., 400001)'}
        {country === 'US' && 'Format: 5 digits (e.g., 12345)'}
        {country === 'CA' && 'Format: 6 digits (e.g., A1A1A1)'}
        {country === 'UK' && 'Format: 7 characters (e.g., SW1A1AA)'}
      </p>
      
      <p className="mt-1 text-xs text-gray-500">
        {value.length}/{getExpectedLength()} characters
      </p>
    </div>
  );
};
