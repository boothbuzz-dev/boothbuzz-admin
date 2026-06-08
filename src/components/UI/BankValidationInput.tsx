import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Building2, CreditCard, User, Hash } from 'lucide-react';
import { 
  validateBankName, 
  validateBankAccountNumber, 
  validateBankIFSC, 
  validateBankMICR, 
  validateBankHolderName 
} from '../../utils/validation';

interface BankValidationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'bankName' | 'accountNumber' | 'ifsc' | 'micr' | 'holderName';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const BankValidationInput: React.FC<BankValidationInputProps> = ({
  label,
  value,
  onChange,
  type,
  required = false,
  disabled = false,
  className = '',
  placeholder
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const showValidation = hasInteracted || isFocused;

  const getValidationResult = () => {
    switch (type) {
      case 'bankName':
        return validateBankName(value);
      case 'accountNumber':
        return validateBankAccountNumber(value);
      case 'ifsc':
        return validateBankIFSC(value);
      case 'micr':
        return validateBankMICR(value);
      case 'holderName':
        return validateBankHolderName(value);
      default:
        return { isValid: true, message: '' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'bankName':
        return <Building2 className="h-4 w-4" />;
      case 'accountNumber':
        return <CreditCard className="h-4 w-4" />;
      case 'ifsc':
      case 'micr':
        return <Hash className="h-4 w-4" />;
      case 'holderName':
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getInputType = () => {
    switch (type) {
      case 'accountNumber':
      case 'micr':
        return 'text';
      default:
        return 'text';
    }
  };

  const getPattern = () => {
    switch (type) {
      case 'accountNumber':
        return '[0-9]{9,18}';
      case 'micr':
        return '[0-9]{9}';
      case 'ifsc':
        return '[A-Za-z]{4}0[A-Za-z0-9]{6}';
      default:
        return undefined;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'accountNumber':
        return 'Account number must be 9-18 digits';
      case 'micr':
        return 'MICR must be exactly 9 digits';
      case 'ifsc':
        return 'IFSC format: HDFC0001234';
      default:
        return undefined;
    }
  };

  const getMaxLength = () => {
    switch (type) {
      case 'accountNumber':
        return 18;
      case 'micr':
        return 9;
      case 'ifsc':
        return 11;
      default:
        return undefined;
    }
  };

  const validationResult = getValidationResult();
  const isError = validationResult && !validationResult.isValid;
  const isSuccess = validationResult && validationResult.isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Format IFSC to uppercase
    if (type === 'ifsc') {
      newValue = newValue.toUpperCase();
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

  return (
    <div className={className}>
      <label className={getLabelClasses()}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {getIcon()}
        </div>
        
        <input
          type={getInputType()}
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
          Valid
        </p>
      )}
      
      {type === 'ifsc' && (
        <p className="mt-1 text-xs text-gray-500">
          Format: HDFC0001234 (4 letters + 0 + 6 alphanumeric)
        </p>
      )}
      
      {type === 'micr' && (
        <p className="mt-1 text-xs text-gray-500">
          Must be exactly 9 digits
        </p>
      )}
      
      {type === 'accountNumber' && (
        <p className="mt-1 text-xs text-gray-500">
          Must be 9-18 digits
        </p>
      )}
    </div>
  );
};
