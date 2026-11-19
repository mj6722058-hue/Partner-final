// Server-only helpers for admin login. Never import this from a 'use client' file.
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto'

const secret = () => {
  const s = process.env.ADMIN_SECRET
  if (!s || s.length < 32) throw new Error('ADMIN_SECRET missing or shorter than 32 chars')
  return s
}
const derive = (label: string) => createHmac('sha256', secret()).update(label).digest()

export function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

// ---- password hashing (used to verify logins) ----
export function hashPassword(p: string) {
  const salt = randomBytes(16)
  return salt.toString('hex') + ':' + scryptSync(p, salt, 32).toString('hex')
}
export function verifyPassword(p: string, stored: string) {
  const [s, h] = stored.split(':')
  if (!s || !h) return false
  const calc = scryptSync(p, Buffer.from(s, 'hex'), 32)
  const exp = Buffer.from(h, 'hex')
  return exp.length === calc.length && timingSafeEqual(calc, exp)
}
// a valid-looking hash used so "unknown user" takes as long as "wrong password"
export const DUMMY_HASH = '00000000000000000000000000000000:' + '0'.repeat(64)

// ---- reversible encryption (only so the main admin can reveal a password with the eye icon) ----
export function encryptText(t: string) {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', derive('enc'), iv)
  const ct = Buffer.concat([c.update(t, 'utf8'), c.final()])
  return [iv, c.getAuthTag(), ct].map((b) => b.toString('base64')).join('.')
}
export function decryptText(s: string) {
  try {
    const [iv, tag, ct] = s.split('.').map((x) => Buffer.from(x, 'base64'))
    const d = createDecipheriv('aes-256-gcm', derive('enc'), iv)
    d.setAuthTag(tag)
    return Buffer.concat([d.update(ct), d.final()]).toString('utf8')
  } catch {
    return ''
  }
}

// ---- signed session cookie ----
export const COOKIE = 'patner_session'
export const SESSION_MS = 12 * 60 * 60 * 1000
export type Session = { u: string; r: 'root' | 'acct'; exp: number }

export function signSession(s: Session) {
  const body = Buffer.from(JSON.stringify(s)).toString('base64url')
  const sig = createHmac('sha256', derive('session')).update(body).digest('base64url')
  return body + '.' + sig
}
export function readSession(token?: string | null): Session | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', derive('session')).update(body).digest('base64url')
  if (!safeEqual(sig, expected)) return null
  try {
    const s = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!s || typeof s.u !== 'string' || (s.r !== 'root' && s.r !== 'acct') || typeof s.exp !== 'number') return null
    if (s.exp < Date.now()) return null
    return s as Session
  } catch {
    return null
  }
}

// ---- best-effort brute force limiter (in memory, per server instance) ----
const fails = new Map<string, { n: number; t: number }>()
const WINDOW = 15 * 60 * 1000
const MAX_FAILS = 5
export function isLocked(key: string) {
  const f = fails.get(key)
  if (!f) return false
  if (Date.now() - f.t > WINDOW) {
    fails.delete(key)
    return false
  }
  return f.n >= MAX_FAILS
}
export function registerFail(key: string) {
  const f = fails.get(key)
  if (!f || Date.now() - f.t > WINDOW) fails.set(key, { n: 1, t: Date.now() })
  else f.n += 1
}
export function clearFails(key: string) {
  fails.delete(key)
}
