/**
 * Email normalization and validation utilities
 * 
 * Features:
 * 1. Case normalization (lowercase)
 * 2. Whitespace trimming
 * 3. Gmail alias handling (+ removal)
 * 4. Email validation
 * 5. Safe comparison
 */

/**
 * Normalize an email address for storage and comparison
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes Gmail aliases (e.g., test+alias@gmail.com → test@gmail.com)
 * - Validates format
 */
export function normalizeEmail(email: string): string {
  if (!email) return email;
  
  // Trim whitespace
  let normalized = email.trim();
  
  // Convert to lowercase
  normalized = normalized.toLowerCase();
  
  // Handle Gmail aliases
  if (normalized.endsWith('@gmail.com')) {
    const [localPart, domain] = normalized.split('@');
    // Remove everything after + (Gmail alias)
    const baseLocalPart = localPart.split('+')[0];
    normalized = `${baseLocalPart}@${domain}`;
  }
  
  return normalized;
}

/**
 * Validate email format
 * Returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const normalized = normalizeEmail(email);
  
  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return false;
  }
  
  // Additional validation: check for common disposable email domains
  const disposableDomains = [
    'tempmail.com', 'mailinator.com', 'guerrillamail.com',
    '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
  ];
  
  const domain = normalized.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return false; // Reject disposable emails
  }
  
  return true;
}

/**
 * Compare two emails for equality after normalization
 */
export function emailsMatch(email1: string, email2: string): boolean {
  return normalizeEmail(email1) === normalizeEmail(email2);
}

/**
 * Check if email is already in use (simulates database check)
 * In real implementation, this would query the database
 */
export async function isEmailAvailable(email: string, prisma: any): Promise<boolean> {
  const normalized = normalizeEmail(email);
  
  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalized }
    });
    
    return !existing; // Available if no user found
  } catch (error) {
    console.error('Email availability check failed:', error);
    return false; // Assume not available on error
  }
}

/**
 * Generate user-friendly error messages for email issues
 */
export function getEmailErrorMessage(email: string, errorType: 'invalid' | 'duplicate' | 'disposable'): string {
  switch (errorType) {
    case 'invalid':
      return 'Please enter a valid email address.';
    case 'duplicate':
      return 'An account with this email already exists. Please sign in or use a different email.';
    case 'disposable':
      return 'Disposable email addresses are not allowed. Please use a permanent email.';
    default:
      return 'Email validation failed.';
  }
}

/**
 * Extract domain from email for analytics/security
 */
export function getEmailDomain(email: string): string | null {
  const normalized = normalizeEmail(email);
  const parts = normalized.split('@');
  return parts.length === 2 ? parts[1] : null;
}

/**
 * Check if email domain is from a major provider
 * Useful for security decisions (e.g., stricter verification for non-major domains)
 */
export function isMajorEmailProvider(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  
  const majorProviders = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'protonmail.com', 'aol.com'
  ];
  
  return majorProviders.includes(domain);
}