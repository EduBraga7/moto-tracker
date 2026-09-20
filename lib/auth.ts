import crypto from 'crypto'

/**
 * Hash a plain text password using scrypt with a cryptographic random salt.
 * Output format: "salt:hash" (hex encoded)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verify a plain text password against a stored "salt:hash" string.
 * Uses crypto.timingSafeEqual to defend against timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':')
    if (!salt || !key) return false

    const keyBuffer = Buffer.from(key, 'hex')
    const derivedKey = crypto.scryptSync(password, salt, 64)

    return crypto.timingSafeEqual(keyBuffer, derivedKey)
  } catch {
    return false
  }
}
