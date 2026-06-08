import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  label?: string;
  name?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "9876543210",
  required = false,
  error,
  className = "",
  label,
  name,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Sync with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Remove all non-digits
    const digits = newValue.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.substring(0, 10);
    
    // Update display
    setInputValue(limitedDigits);
    
    // Send to parent
    onChange(limitedDigits);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and control keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    if (allowedKeys.includes(e.key)) {
      return;
    }
    
    // Only allow digits
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    
    // Check if we already have 10 digits
    if (inputValue.length >= 10) {
      e.preventDefault();
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').substring(0, 10);
    
    if (digits) {
      setInputValue(digits);
      onChange(digits);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {/* <Phone className="absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" /> */}
        <span className="absolute left-1 top-1/3 h-3 w-3 -translate-y-1/2 text-gray-400">+91-&nbsp;</span>
        <input
          type="tel"
          name={name}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
          placeholder={placeholder}
          maxLength={10}
          autoComplete="tel"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {!error && value.length > 0 && value.length < 10 && (
        <p className="mt-1 text-sm text-amber-600">
          Phone number must be exactly 10 digits
        </p>
      )}
      {!error && value.length === 10 && (
        <p className="mt-1 text-sm text-green-600">
          ✓ Valid phone number
        </p>
      )}
    </div>
  );
}; 