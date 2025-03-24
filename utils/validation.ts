/**
 * Utility functions for input validation
 */

/**
 * Validates an email address
 * @param email Email address to validate
 * @returns boolean indicating if the email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validates if an address is not empty
 * @param address Address to validate
 * @returns boolean indicating if the address is valid
 */
export const validateAddress = (address: string): boolean => {
  return address.trim().length > 0;
};

/**
 * Validates a phone number
 * @param phoneNumber Phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return phoneNumber.startsWith('+60') && phoneNumber.length >= 10;
};

/**
 * Formats a phone number to ensure it starts with +60
 * @param text Phone number text to format
 * @returns formatted phone number
 */
export const formatPhoneNumber = (text: string): string => {
  if (!text.startsWith('+60')) {
    return '+60' + text.replace(/[^0-9]/g, '');
  } else {
    return text.replace(/[^0-9+]/g, '');
  }
};

/**
 * Validates a password
 * @param password Password to validate
 * @returns boolean indicating if the password is valid
 */
export const validatePassword = (password: string): boolean => {
  // Password must be at least 8 characters long, contain a number and a special character
  const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
}; 