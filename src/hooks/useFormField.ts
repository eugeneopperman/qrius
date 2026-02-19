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

/**
 * Hook for managing multiple form fields with validation.
 * Provides a cleaner API for forms with multiple validated fields.
 */
export function useFormFields<T extends Record<string, unknown>>(
  values: T,
  validators: Partial<Record<keyof T, (value: T[keyof T]) => ValidationResult>>
) {
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => {
      const validator = validators[field];
      const isTouched = touched[field] || false;
      const validation = isTouched && validator
        ? validator(values[field])
        : { isValid: true };

      return {
        touched: isTouched,
        validation,
        error: validation.error,
        isValid: validation.isValid,
        onBlur: () => handleBlur(field),
      };
    },
    [values, validators, touched, handleBlur]
  );

  const resetField = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: false }));
  }, []);

  const resetAll = useCallback(() => {
    setTouched({});
  }, []);

  // Check if all fields are valid (including untouched fields)
  const isFormValid = useMemo(() => {
    return Object.entries(validators).every(([field, validator]) => {
      if (!validator) return true;
      const result = validator(values[field as keyof T]);
      return result.isValid;
    });
  }, [values, validators]);

  return {
    touched,
    getFieldProps,
    handleBlur,
    resetField,
    resetAll,
    isFormValid,
  };
}
