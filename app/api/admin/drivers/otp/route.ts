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

// POST { countryCode, phone } -> sends (here: generates) an OTP for driver signup.
// There is no SMS provider wired in yet, so the code is returned in the response so the flow can be
// tested end to end; once an SMS account is connected, stop returning devCode and send it by SMS instead.
export async function POST(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isLocked('otp:' + ip)) return fail('Bohat zyada koshishen. Thori dair baad try karein', 429)

    const b = await req.json().catch(() => ({}))
    const p = cleanPhone(b.countryCode, b.phone)
    if (!p) return fail('Phone number theek nahi', 400)

    const { data: existing, error: e1 } = await adminDb().from('drivers').select('id').eq('phone', p.num).maybeSingle()
    if (e1) throw e1
    if (existing) return fail('Is number per pehle se ID bani hui hai', 409)

    registerFail('otp:' + ip) // counts attempts regardless of outcome, cleared on successful verify
    const code = randomInt(0, 1000000).toString().padStart(6, '0')
    const { error } = await adminDb().from('driver_otps').insert({
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

// PUT { countryCode, phone, code } -> verify only (actual driver creation happens in POST /api/admin/drivers,
// which calls verifyOtp from this same file... kept here as a thin re-check used by that route).
export async function PUT(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const b = await req.json().catch(() => ({}))
    const p = cleanPhone(b.countryCode, b.phone)
    if (!p) return fail('Phone number theek nahi', 400)
    if (typeof b.code !== 'string' || !/^\d{6}$/.test(b.code)) return fail('6 digit OTP likhein', 400)

    const { data, error } = await adminDb()
      .from('driver_otps')
      .select('id,code_hash,attempts,expires_at')
      .eq('phone', p.full)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (!data || new Date(data.expires_at) < new Date()) return fail('OTP expire ho gaya hai, dobara bhejein', 400)
    if (data.attempts >= 5) return fail('Bohat zyada ghalat koshishen, naya OTP mangwayen', 400)
    if (hashCode(b.code) !== data.code_hash) {
      await adminDb().from('driver_otps').update({ attempts: data.attempts + 1 }).eq('id', data.id)
      return fail('Ghalat OTP', 400)
    }
    await adminDb().from('driver_otps').delete().eq('phone', p.full)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverError(e)
  }
}
