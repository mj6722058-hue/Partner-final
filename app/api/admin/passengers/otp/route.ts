import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomInt } from 'crypto'
import { adminDb, fail, getSession, serverError } from '@/lib/admin-server'
import { isLocked, registerFail } from '@/lib/admin-crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hashCode = (c: string) => createHash('sha256').update(c).digest('hex')
const OTP_TTL_MS = 5 * 60 * 1000

function cleanPhone(countryCode: unknown, phone: unknown) {
  if (typeof countryCode !== 'string' || typeof phone !== 'string') return null
  const cc = countryCode.trim()
  const num = phone.replace(/\D/g, '')
  if (!/^\+\d{1,4}$/.test(cc) || num.length < 6 || num.length > 15) return null
  return { cc, num, full: cc + num }
}

// POST { countryCode, phone } -> generates an OTP for passenger signup.
// No SMS provider is wired in yet, so the code is returned in the response (devCode) to test the flow end to end.
export async function POST(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isLocked('potp:' + ip)) return fail('Bohat zyada koshishen. Thori dair baad try karein', 429)

    const b = await req.json().catch(() => ({}))
    const p = cleanPhone(b.countryCode, b.phone)
    if (!p) return fail('Phone number theek nahi', 400)

    const { data: existing, error: e1 } = await adminDb().from('passengers').select('id').eq('phone', p.num).maybeSingle()
    if (e1) throw e1
    if (existing) return fail('Is number per pehle se ID bani hui hai', 409)

    registerFail('potp:' + ip)
    const code = randomInt(0, 1000000).toString().padStart(6, '0')
    const { error } = await adminDb().from('passenger_otps').insert({
      phone: p.full,
      code_hash: hashCode(code),
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    })
    if (error) throw error
    return NextResponse.json({ ok: true, devCode: code, expiresInSec: OTP_TTL_MS / 1000 })
  } catch (e) {
    return serverError(e)
  }
}
