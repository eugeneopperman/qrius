import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult } from '@/utils/validators';

/**
 * Hook for managing a form field with validation.
 * Handles touched state and only shows errors after the field has been interacted with.
 */
export function useFormField<T>(
  value: T,
  validator?: (value: T) => ValidationResult
) {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => {
    if (!touched || !validator) {
      return { isValid: true };
    }
    return validator(value);
  }, [touched, validator, value]);

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const reset = useCallback(() => {
    setTouched(false);
  }, []);

  return {
    touched,
    validation,
    error: validation.error,
    isValid: validation.isValid,
    handleBlur,
    reset,
  };
}

