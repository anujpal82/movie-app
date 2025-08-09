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

// Movie validation functions
export const validateMovieTitle = (title: string): string | null => {
  if (!title.trim()) {
    return i18n.t('validation.title_required');
  }
  
  if (title.trim().length < 2) {
    return i18n.t('validation.title_min', { min: 2 });
  }
  
  if (title.length > 200) {
    return i18n.t('validation.title_max', { max: 200 });
  }
  
  // Check for excessive whitespace
  if (/\s{3,}/.test(title)) {
    return i18n.t('validation.title_spaces');
  }
  
  // Check for invalid characters (allow letters, numbers, spaces, hyphens, apostrophes, and common punctuation)
  if (!/^[a-zA-Z0-9\s\-'.,!?&()]+$/.test(title)) {
    return i18n.t('validation.title_charset');
  }
  
  return null;
};

export const validatePublishingYear = (year: string): string | null => {
  if (!year.trim()) {
    return i18n.t('validation.year_required');
  }
  
  const yearNum = parseInt(year, 10);
  
  if (isNaN(yearNum)) {
    return i18n.t('validation.year_numeric');
  }
  
  if (yearNum < 1888) {
    return i18n.t('validation.year_min', { min: 1888 });
  }
  
  if (yearNum > new Date().getFullYear() + 1) {
    return i18n.t('validation.year_max', { max: new Date().getFullYear() + 1 });
  }
  
  return null;
};

export const validateImageUrl = (url: string): string | null => {
  if (!url.trim()) {
    return null; // URL is optional if file is uploaded
  }
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return i18n.t('validation.image_url_protocol');
    }
  } catch {
    return i18n.t('validation.image_url_invalid');
  }
  // Many CDNs and signed URLs omit file extensions; accept valid http(s) URLs without enforcing extension
  
  if (url.length > 500) {
    return i18n.t('validation.image_url_max', { max: 500 });
  }
  
  return null;
};

export const validateImageFile = (file: File | null): string | null => {
  if (!file) {
    return null; // File is optional if URL is provided
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return i18n.t('validation.image_size_max', { max: '5MB' });
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    return i18n.t('validation.image_type');
  }
  
  // Check for specific image formats
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return i18n.t('validation.image_format');
  }
  
  return null;
};

export const validateMovieForm = (
  title: string,
  publishingYear: string,
  imageFile: File | null,
  imageUrl: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const titleError = validateMovieTitle(title);
  if (titleError) {
    errors.push({ field: 'title', message: titleError });
  }

  const yearError = validatePublishingYear(publishingYear);
  if (yearError) {
    errors.push({ field: 'publishingYear', message: yearError });
  }

  // Validate image (either file or URL must be provided)
  if (!imageFile && !imageUrl.trim()) {
    errors.push({ field: 'image', message: i18n.t('validation.image_required') });
  } else {
    const imageUrlError = validateImageUrl(imageUrl);
    if (imageUrlError) {
      errors.push({ field: 'imageUrl', message: imageUrlError });
    }

    const imageFileError = validateImageFile(imageFile);
    if (imageFileError) {
      errors.push({ field: 'imageFile', message: imageFileError });
    }
  }

  return errors;
};

// Real-time validation for movie form fields
export const validateMovieFieldOnBlur = (
  field: string,
  value: string,
  imageFile?: File | null
): string | null => {
  switch (field) {
    case 'title':
      return validateMovieTitle(value);
    case 'publishingYear':
      return validatePublishingYear(value);
    case 'imageUrl':
      return validateImageUrl(value);
    case 'imageFile':
      return validateImageFile(imageFile || null);
    default:
      return null;
  }
};
