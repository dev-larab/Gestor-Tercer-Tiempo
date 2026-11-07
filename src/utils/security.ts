/**
 * Security & Cryptography Utilities for La Única Rugby Taldea
 * Uses native Web Crypto API for SHA-256 password hashing.
 */

/**
 * Computes a standard SHA-256 hash string (lowercase hex) for any plain text.
 * Runs client-side with native browser hardware acceleration.
 */
export async function hashPassword(plainText: string): Promise<string> {
  const clean = plainText.trim();
  if (!clean) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(clean);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies a candidate password against a user record.
 * Supports secure SHA-256 hashes as primary, with seamless fallback for any legacy plain-text records.
 */
export async function verifyUserPassword(
  inputPlain: string,
  user: { passwordHash?: string; password?: string }
): Promise<boolean> {
  const cleanInput = inputPlain.trim();
  if (!cleanInput) return false;

  // 1. Primary check: match against SHA-256 hash
  if (user.passwordHash) {
    const inputHash = await hashPassword(cleanInput);
    return inputHash === user.passwordHash;
  }

  // 2. Fallback check: match legacy plain text if hash hasn't been set yet
  if (user.password) {
    return user.password === cleanInput;
  }

  return false;
}
