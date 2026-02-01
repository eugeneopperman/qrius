// Short code generation for trackable QR codes
// Uses a URL-safe alphabet (no confusing characters like 0/O, l/1)

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const CODE_LENGTH = 6;

/**
 * Generate a random short code for QR tracking URLs
 * @returns A 6-character alphanumeric short code
 */
export function generateShortCode(): string {
  let code = '';
  const randomValues = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));

  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomValues[i] % ALPHABET.length];
  }

  return code;
}

/**
 * Validate a short code format
 * @param code The code to validate
 * @returns true if valid format
 */
export function isValidShortCode(code: string): boolean {
  if (!code || code.length !== CODE_LENGTH) {
    return false;
  }

  return [...code].every(char => ALPHABET.includes(char));
}
