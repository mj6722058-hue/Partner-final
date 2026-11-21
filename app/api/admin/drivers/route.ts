import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { decryptText, encryptText, hashPassword } from '@/lib/admin-crypto'
import { adminDb, fail, getSession, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hashCode = (c: string) => createHash('sha256').update(c).digest('hex')
const validUsername = (u: unknown): u is string => typeof u === 'string' && u.trim().length >= 3 && u.trim().length <= 50
const validPassword = (p: unknown): p is string => typeof p === 'string' && p.length >= 8 && p.length <= 100
const validName = (n: unknown): n is string => typeof n === 'string' && n.trim().length >= 1 && n.trim().length <= 60

const COLS = `id,list_no,first_name,last_name,gender,country_code,phone,username,status,rating,rating_count,
 selfie_url,id_front_url,id_back_url,lic_front_url,lic_back_url,car_images,car_company,car_name,car_model,created_at`

// GET ?search=&status=&reveal=username -> list (with search + status filter), or one password reveal
export async function GET(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)

    const reveal = req.nextUrl.searchParams.get('reveal')
    if (reveal) {
      const { data, error } = await adminDb().from('drivers').select('password_enc').eq('username', reveal).maybeSingle()
      if (error) throw error
      if (!data) return fail('ID nahi mili', 404)
      return NextResponse.json({ password: decryptText(data.password_enc) })
    }

    const search = (req.nextUrl.searchParams.get('search') || '').trim()
    const status = req.nextUrl.searchParams.get('status') // 'active' | 'blocked' | null
    let q = adminDb().from('drivers').select(COLS).order('list_no', { ascending: true })
    if (status === 'active' || status === 'blocked') q = q.eq('status', status)
    if (search) {
      const n = Number(search)
      q = Number.isInteger(n) && String(n) === search
        ? q.or(`list_no.eq.${n},phone.eq.${search}`)
        : q.ilike('phone', `%${search}%`)
    }
    const { data, error } = await q.limit(500)
    if (error) throw error
    return NextResponse.json({ drivers: data })
  } catch (e) {
    return serverError(e)
  }
}

// POST: create a driver. Requires a verified OTP (checked here directly, same as the OTP route's own check,
// so a request can't skip straight to creation without ever calling verify).
export async function POST(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const b = await req.json().catch(() => ({}))

    if (!validName(b.firstName) || !validName(b.lastName)) return fail('Pehla aur aakhri naam likhein', 400)
    if (b.gender !== 'male' && b.gender !== 'female') return fail('Gender chunein', 400)
    if (!validUsername(b.username)) return fail('Username 3 se 50 harf ka ho', 400)
    if (!validPassword(b.password)) return fail('Password kam az kam 8 characters ka ho', 400)
    const cc = typeof b.countryCode === 'string' ? b.countryCode.trim() : ''
    const phone = typeof b.phone === 'string' ? b.phone.replace(/\D/g, '') : ''
    if (!/^\+\d{1,4}$/.test(cc) || phone.length < 6 || phone.length > 15) return fail('Phone number theek nahi', 400)
    if (typeof b.otp !== 'string' || !/^\d{6}$/.test(b.otp)) return fail('OTP likhein', 400)

    const full = cc + phone
    const { data: otpRow, error: e1 } = await adminDb()
      .from('driver_otps').select('id,code_hash,expires_at').eq('phone', full)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (e1) throw e1
    if (!otpRow || new Date(otpRow.expires_at) < new Date()) return fail('OTP expire ho gaya, dobara mangwayen', 400)
    if (hashCode(b.otp) !== otpRow.code_hash) return fail('Ghalat OTP', 400)

    const carImages = Array.isArray(b.carImages) ? b.carImages.filter((x: unknown) => typeof x === 'string').slice(0, 12) : []
    const { data, error } = await adminDb().from('drivers').insert({
      first_name: b.firstName.trim(), last_name: b.lastName.trim(), gender: b.gender,
      country_code: cc, phone,
      username: b.username.trim(),
      password_hash: hashPassword(b.password), password_enc: encryptText(b.password),
      selfie_url: b.selfieUrl || null, id_front_url: b.idFrontUrl || null, id_back_url: b.idBackUrl || null,
      lic_front_url: b.licFrontUrl || null, lic_back_url: b.licBackUrl || null,
      car_images: carImages,
      car_company: b.carCompany || null, car_name: b.carName || null, car_model: b.carModel || null,
    }).select('list_no').single()
    if (error) {
      if ((error as any).code === '23505') return fail('Ye phone number ya username pehle se maujood hai', 409)
      throw error
    }
    await adminDb().from('driver_otps').delete().eq('phone', full)
    return NextResponse.json({ ok: true, listNo: data.list_no })
  } catch (e) {
    return serverError(e)
  }
}

// body: { id, firstName?, lastName?, gender?, newPassword?, status?, carCompany?, carName?, carModel?, ...image fields }
export async function PATCH(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const b = await req.json().catch(() => ({}))
    if (typeof b.id !== 'string' || !b.id) return fail('ID nahi di', 400)

    const update: Record<string, unknown> = {}
    if (b.firstName !== undefined) { if (!validName(b.firstName)) return fail('Pehla naam theek nahi', 400); update.first_name = b.firstName.trim() }
    if (b.lastName !== undefined) { if (!validName(b.lastName)) return fail('Aakhri naam theek nahi', 400); update.last_name = b.lastName.trim() }
    if (b.gender !== undefined) { if (b.gender !== 'male' && b.gender !== 'female') return fail('Gender theek nahi', 400); update.gender = b.gender }
    if (b.newPassword) { if (!validPassword(b.newPassword)) return fail('Password kam az kam 8 characters ka ho', 400); update.password_hash = hashPassword(b.newPassword); update.password_enc = encryptText(b.newPassword) }
    if (typeof b.status === 'string') { if (b.status !== 'active' && b.status !== 'blocked') return fail('Status theek nahi', 400); update.status = b.status }
    const fieldMap: Record<string, string> = {
      carCompany: 'car_company', carName: 'car_name', carModel: 'car_model',
      selfieUrl: 'selfie_url', idFrontUrl: 'id_front_url', idBackUrl: 'id_back_url',
      licFrontUrl: 'lic_front_url', licBackUrl: 'lic_back_url',
    }
    for (const [k, col] of Object.entries(fieldMap)) if (b[k] !== undefined) update[col] = b[k] || null
    if (Array.isArray(b.carImages)) update.car_images = b.carImages.filter((x: unknown) => typeof x === 'string').slice(0, 12)
    if (Object.keys(update).length === 0) return fail('Kuch change nahi kiya', 400)

    const { data, error } = await adminDb().from('drivers').update(update).eq('id', b.id).select('id')
    if (error) throw error
    if (!data || data.length === 0) return fail('ID nahi mili', 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverError(e)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const b = await req.json().catch(() => ({}))
    if (typeof b.id !== 'string' || !b.id) return fail('ID nahi di', 400)
    const { error } = await adminDb().from('drivers').delete().eq('id', b.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverError(e)
  }
}
