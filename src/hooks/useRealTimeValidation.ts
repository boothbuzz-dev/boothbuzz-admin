import { useState, useCallback } from 'react';
import { ValidationResult } from '../utils/validation';

interface UseRealTimeValidationProps {
  initialErrors?: Record<string, string>;
}

export const useRealTimeValidation = ({ initialErrors = {} }: UseRealTimeValidationProps = {}) => {
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);

  const validateField = useCallback((field: string, value: any, validationFn: () => ValidationResult | null) => {
    const validationResult = validationFn();
    
    if (validationResult && !validationResult.isValid) {
      setErrors(prev => ({ ...prev, [field]: validationResult.message }));
      return false;
    } else if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    return true;
  }, [errors]);

  const clearFieldError = useCallback((field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    validateField,
    clearFieldError,
    clearAllErrors,
    setFieldError,
    hasErrors,
    setErrors
  };
};
