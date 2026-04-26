import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Validates email format
   * @param email - Email string to validate
   * @returns Object with isValid boolean and error message
   */
  validateEmail(email: string): { isValid: boolean; message: string } {
    if (!email || email.trim() === '') {
      return { isValid: false, message: 'Email is required' };
    }

    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address (e.g., user@example.com)' };
    }

    if (email.length > 100) {
      return { isValid: false, message: 'Email cannot exceed 100 characters' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validates phone number format
   * @param phone - Phone string to validate
   * @returns Object with isValid boolean and error message
   */
  validatePhone(phone: string): { isValid: boolean; message: string } {
    if (!phone || phone.trim() === '') {
      return { isValid: false, message: 'Phone number is required' };
    }

    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if phone contains only valid characters (digits, spaces, hyphens, parentheses, plus)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return { isValid: false, message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign' };
    }

    // Check length (7-15 digits is standard)
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return { isValid: false, message: 'Phone number must be between 7 and 15 digits' };
    }

    if (phone.length > 20) {
      return { isValid: false, message: 'Phone number cannot exceed 20 characters' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validates name format
   * @param name - Name string to validate
   * @returns Object with isValid boolean and error message
   */
  validateName(name: string): { isValid: boolean; message: string } {
    if (!name || name.trim() === '') {
      return { isValid: false, message: 'Name is required' };
    }

    // Check for minimum length
    if (name.trim().length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }

    // Check for maximum length
    if (name.length > 100) {
      return { isValid: false, message: 'Name cannot exceed 100 characters' };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes, periods)
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods' };
    }

    // Check for consecutive spaces
    if (name.includes('  ')) {
      return { isValid: false, message: 'Name cannot contain consecutive spaces' };
    }

    // Check for leading/trailing spaces (should be handled by trim, but just in case)
    if (name !== name.trim()) {
      return { isValid: false, message: 'Name cannot start or end with spaces' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validates company name format
   * @param companyName - Company name string to validate
   * @returns Object with isValid boolean and error message
   */
  validateCompanyName(companyName: string): { isValid: boolean; message: string } {
    if (!companyName || companyName.trim() === '') {
      return { isValid: false, message: 'Company name is required' };
    }

    // Check for minimum length
    if (companyName.trim().length < 2) {
      return { isValid: false, message: 'Company name must be at least 2 characters long' };
    }

    // Check for maximum length
    if (companyName.length > 100) {
      return { isValid: false, message: 'Company name cannot exceed 100 characters' };
    }

    // Check for valid characters (letters, numbers, spaces, hyphens, apostrophes, periods, ampersands, commas)
    const companyNameRegex = /^[a-zA-Z0-9\s\-'\.&,]+$/;
    if (!companyNameRegex.test(companyName)) {
      return { isValid: false, message: 'Company name can only contain letters, numbers, spaces, hyphens, apostrophes, periods, ampersands, and commas' };
    }

    // Check for consecutive spaces
    if (companyName.includes('  ')) {
      return { isValid: false, message: 'Company name cannot contain consecutive spaces' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validates password strength
   * @param password - Password string to validate
   * @returns Object with isValid boolean and error message
   */
  validatePassword(password: string): { isValid: boolean; message: string } {
    if (!password || password === '') {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    if (password.length > 50) {
      return { isValid: false, message: 'Password cannot exceed 50 characters' };
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter) {
      return { isValid: false, message: 'Password must contain at least one letter' };
    }

    if (!hasNumber) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validates URL format
   * @param url - URL string to validate
   * @returns Object with isValid boolean and error message
   */
  validateUrl(url: string): { isValid: boolean; message: string } {
    if (!url || url.trim() === '') {
      return { isValid: true, message: '' }; // URL is optional
    }

    try {
      new URL(url);
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: 'Please enter a valid URL (e.g., https://example.com)' };
    }
  }

  /**
   * Validates that two passwords match
   * @param password - Original password
   * @param confirmPassword - Confirmation password
   * @returns Object with isValid boolean and error message
   */
  validatePasswordMatch(password: string, confirmPassword: string): { isValid: boolean; message: string } {
    if (password !== confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: '' };
  }
}
