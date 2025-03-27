import { 
  validateEmail, 
  validateAddress, 
  validatePhoneNumber, 
  formatPhoneNumber,
  validatePassword
} from '../../utils/validation';

describe('Email Validation', () => {
  // Valid email tests
  test('should accept valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@gmail.com')).toBe(true);
    expect(validateEmail('user_name@domain.com')).toBe(true);
    expect(validateEmail('123@domain.com')).toBe(true);
  });

  // Invalid email tests
  test('should reject invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('plaintext')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
    expect(validateEmail('user@domain.')).toBe(false);
    expect(validateEmail('user name@domain.com')).toBe(false);
  });
});

describe('Address Validation', () => {
  // Valid address tests
  test('should accept non-empty addresses', () => {
    expect(validateAddress('123 Main St')).toBe(true);
    expect(validateAddress('Apartment 4B, Tower Block')).toBe(true);
    expect(validateAddress('42')).toBe(true);
  });

  // Invalid address tests - boundary testing
  test('should reject empty addresses', () => {
    expect(validateAddress('')).toBe(false);
    expect(validateAddress('   ')).toBe(false); // Just spaces
    expect(validateAddress('\t')).toBe(false); // Tab character
    expect(validateAddress('\n')).toBe(false); // Newline character
  });
});

describe('Phone Number Validation', () => {
  // Valid phone number tests
  test('should accept valid Malaysian phone numbers', () => {
    expect(validatePhoneNumber('+60123456789')).toBe(true);
    expect(validatePhoneNumber('+601234567890')).toBe(true); // Longer number
  });

  // Invalid phone number tests
  test('should reject invalid phone numbers', () => {
    expect(validatePhoneNumber('')).toBe(false);
    expect(validatePhoneNumber('123456789')).toBe(false); // Missing +60
    expect(validatePhoneNumber('+123456789')).toBe(false); // Wrong prefix
    expect(validatePhoneNumber('+6012')).toBe(false); // Too short
  });
});

describe('Phone Number Formatting', () => {
  // Test adding +60 prefix
  test('should add +60 prefix to numbers without it', () => {
    expect(formatPhoneNumber('123456789')).toBe('+60123456789');
    expect(formatPhoneNumber('0123456789')).toBe('+600123456789');
  });

  // Test keeping existing +60 prefix
  test('should keep +60 prefix if already present', () => {
    expect(formatPhoneNumber('+60123456789')).toBe('+60123456789');
  });

  // Test removing non-numeric characters
  test('should remove non-numeric characters', () => {
    expect(formatPhoneNumber('abc123')).toBe('+60123');
    expect(formatPhoneNumber('+60abc123')).toBe('+60123');
    expect(formatPhoneNumber('+60-123-456-789')).toBe('+60123456789');
  });

  // Boundary test
  test('should handle empty string', () => {
    expect(formatPhoneNumber('')).toBe('+60');
  });
});

describe('Password Validation', () => {
  // Valid password tests
  test('should accept valid passwords', () => {
    expect(validatePassword('Password1!')).toBe(true);
    expect(validatePassword('Test_123')).toBe(true);
    expect(validatePassword('Secure@Pass2023')).toBe(true);
    expect(validatePassword('12345678!')).toBe(true);
  });

  // Invalid password tests
  test('should reject invalid passwords', () => {
    // Too short
    expect(validatePassword('Pass1!')).toBe(false);
    
    // No number
    expect(validatePassword('Password!')).toBe(false);
    
    // No special character
    expect(validatePassword('Password123')).toBe(false);
    
    // Empty password
    expect(validatePassword('')).toBe(false);
  });

  // Boundary tests
  test('should handle boundary cases', () => {
    // Exactly 8 characters with required elements
    expect(validatePassword('Pass1!')).toBe(false); // 6 chars - too short
    expect(validatePassword('Passw1!')).toBe(false); // 7 chars - too short
    expect(validatePassword('Passwo1!')).toBe(true); // 8 chars - minimum length
    
    // Special character at different positions
    expect(validatePassword('!Passw0rd')).toBe(true); // At beginning
    expect(validatePassword('Passw0rd!')).toBe(true); // At end
    expect(validatePassword('Pass!w0rd')).toBe(true); // In middle
  });
}); 