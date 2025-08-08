import { ValidationError } from '../types/auth';
import i18n from '../i18n';

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return i18n.t('validation.email_required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return i18n.t('validation.email_invalid');
  }
  
  if (email.length > 100) {
    return i18n.t('validation.email_max', { max: 100 });
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return i18n.t('validation.password_required');
  }
  
  if (password.length < 6) {
    return i18n.t('validation.password_min', { min: 6 });
  }
  
  if (password.length > 50) {
    return i18n.t('validation.password_max', { max: 50 });
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return i18n.t('validation.password_uppercase');
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return i18n.t('validation.password_lowercase');
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return i18n.t('validation.password_number');
  }
  
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return i18n.t('validation.name_required');
  }
  
  if (name.trim().length < 2) {
    return i18n.t('validation.name_min', { min: 2 });
  }
  
  if (name.length > 50) {
    return i18n.t('validation.name_max', { max: 50 });
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return i18n.t('validation.name_charset');
  }
  
  // Check for consecutive spaces
  if (/\s{2,}/.test(name)) {
    return i18n.t('validation.name_spaces');
  }
  
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return i18n.t('validation.confirm_required');
  }
  
  if (password !== confirmPassword) {
    return i18n.t('validation.confirm_mismatch');
  }
  
  return null;
};

export const validateLoginForm = (email: string, password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  return errors;
};

export const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
  name: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError });
  }

  const nameError = validateName(name);
  if (nameError) {
    errors.push({ field: 'name', message: nameError });
  }

  return errors;
};

// Real-time validation helpers
export const validateFieldOnBlur = (
  field: string,
  value: string,
  password?: string
): string | null => {
  switch (field) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'name':
      return validateName(value);
    case 'confirmPassword':
      return password ? validateConfirmPassword(password, value) : i18n.t('validation.confirm_required');
    default:
      return null;
  }
};

// Check if form is valid
export const isFormValid = (errors: ValidationError[]): boolean => {
  return errors.length === 0;
};

// Get field error
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(err => err.field === field);
  return error ? error.message : null;
};
