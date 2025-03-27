/**
 * Tests for form validation utility functions extracted from the registration screens
 */

// Utility functions extracted from the registration components for testing
const isFormComplete = (fields: Record<string, string | null>): boolean => {
  return Object.values(fields).every(value => value !== null && value.trim() !== '');
};

const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isPasswordValid = (password: string): boolean => {
  const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
};

const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

const formatPhoneNumber = (text: string): string => {
  if (!text.startsWith('+60')) {
    return '+60' + text.replace(/[^0-9]/g, '');
  } else {
    return text.replace(/[^0-9+]/g, '');
  }
};

const isPhoneNumberValid = (phoneNumber: string): boolean => {
  return phoneNumber.startsWith('+60') && phoneNumber.length >= 10;
};

const isBusinessRegistrationNumberInUse = (brn: string, existingBrns: string[]): boolean => {
  return existingBrns.includes(brn);
};

const isEmailInUse = (email: string, existingEmails: string[]): boolean => {
  return existingEmails.includes(email);
};

describe('Form Validation Utilities', () => {
  describe('isFormComplete', () => {
    test('should return true when all fields are filled', () => {
      const fields = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+601234567890'
      };
      expect(isFormComplete(fields)).toBe(true);
    });

    test('should return false when any field is empty', () => {
      const fields = {
        name: 'John Doe',
        email: '',
        phone: '+601234567890'
      };
      expect(isFormComplete(fields)).toBe(false);
    });

    test('should return false when any field is only whitespace', () => {
      const fields = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '   '
      };
      expect(isFormComplete(fields)).toBe(false);
    });

    test('should return false when any field is null', () => {
      const fields = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: null
      };
      expect(isFormComplete(fields)).toBe(false);
    });
  });

  describe('isEmailValid', () => {
    test('should return true for valid email formats', () => {
      expect(isEmailValid('test@example.com')).toBe(true);
      expect(isEmailValid('user.name@domain.co.uk')).toBe(true);
      expect(isEmailValid('user+tag@gmail.com')).toBe(true);
    });

    test('should return false for invalid email formats', () => {
      expect(isEmailValid('')).toBe(false);
      expect(isEmailValid('plaintext')).toBe(false);
      expect(isEmailValid('missing@domain')).toBe(false);
      expect(isEmailValid('@domain.com')).toBe(false);
      expect(isEmailValid('user@.com')).toBe(false);
    });
  });

  describe('isPasswordValid', () => {
    test('should return true for valid passwords', () => {
      expect(isPasswordValid('Password1!')).toBe(true);
      expect(isPasswordValid('Test_123')).toBe(true);
      expect(isPasswordValid('Secure@Pass2023')).toBe(true);
    });

    test('should return false for invalid passwords', () => {
      expect(isPasswordValid('')).toBe(false);
      expect(isPasswordValid('short1!')).toBe(false); // too short
      expect(isPasswordValid('PasswordNoNumber!')).toBe(false); // no number
      expect(isPasswordValid('Password12345')).toBe(false); // no special character
    });
  });

  describe('doPasswordsMatch', () => {
    test('should return true when passwords match', () => {
      expect(doPasswordsMatch('Password123!', 'Password123!')).toBe(true);
    });

    test('should return false when passwords do not match', () => {
      expect(doPasswordsMatch('Password123!', 'Password124!')).toBe(false);
      expect(doPasswordsMatch('Password123!', 'password123!')).toBe(false); // case sensitive
    });
  });

  describe('formatPhoneNumber', () => {
    test('should add +60 prefix to numbers without it', () => {
      expect(formatPhoneNumber('123456789')).toBe('+60123456789');
    });

    test('should keep +60 prefix if already present', () => {
      expect(formatPhoneNumber('+60123456789')).toBe('+60123456789');
    });

    test('should remove non-numeric characters except +', () => {
      expect(formatPhoneNumber('+60-123-456-789')).toBe('+60123456789');
      expect(formatPhoneNumber('abc123')).toBe('+60123');
    });
  });

  describe('isPhoneNumberValid', () => {
    test('should return true for valid Malaysian phone numbers', () => {
      expect(isPhoneNumberValid('+60123456789')).toBe(true);
      expect(isPhoneNumberValid('+601234567890')).toBe(true);
    });

    test('should return false for invalid phone numbers', () => {
      expect(isPhoneNumberValid('')).toBe(false);
      expect(isPhoneNumberValid('123456789')).toBe(false); // no +60 prefix
      expect(isPhoneNumberValid('+6012')).toBe(false); // too short
    });
  });

  describe('isBusinessRegistrationNumberInUse', () => {
    const existingBrns = ['123456789', '987654321'];

    test('should return true if BRN is already in use', () => {
      expect(isBusinessRegistrationNumberInUse('123456789', existingBrns)).toBe(true);
    });

    test('should return false if BRN is not in use', () => {
      expect(isBusinessRegistrationNumberInUse('555555555', existingBrns)).toBe(false);
    });
  });

  describe('isEmailInUse', () => {
    const existingEmails = ['test@example.com', 'user@gmail.com'];

    test('should return true if email is already in use', () => {
      expect(isEmailInUse('test@example.com', existingEmails)).toBe(true);
    });

    test('should return false if email is not in use', () => {
      expect(isEmailInUse('new.user@example.com', existingEmails)).toBe(false);
    });
  });
}); 