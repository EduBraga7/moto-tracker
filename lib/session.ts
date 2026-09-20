import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'moto_tracker_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'moto_tracker_secret_fallback_key_2026_secure'

export type SessionUser = {
  id: number
  name: string
  email: string
  role: string
  authProvider?: 'email' | 'google' | 'github'
  avatarUrl?: string
}

function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET)
  hmac.update(payload)
  const signature = hmac.digest('hex')
  return `${Buffer.from(payload).toString('base64url')}.${signature}`
}

function verify(token: string): string | null {
  try {
    const [b64Payload, signature] = token.split('.')
    if (!b64Payload || !signature) return null

    const payload = Buffer.from(b64Payload, 'base64url').toString('utf-8')
    const hmac = crypto.createHmac('sha256', SESSION_SECRET)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return payload
    }
    return null
  } catch {
    return null
  }
}

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies()
  const payload = JSON.stringify(user)
  const signedToken = sign(payload)

  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(SESSION_COOKIE_NAME)
    if (!cookie?.value) return null

    const payload = verify(cookie.value)
    if (!payload) return null

    return JSON.parse(payload) as SessionUser
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
  } catch (err) {
    console.error('Failed to delete session cookie:', err)
  }
}
