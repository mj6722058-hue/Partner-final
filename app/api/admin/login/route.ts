import { NextRequest, NextResponse } from 'next/server'
import {
  COOKIE,
  DUMMY_HASH,
  SESSION_MS,
  Session,
  clearFails,
  isLocked,
  registerFail,
  safeEqual,
  signSession,
  verifyPassword,
} from '@/lib/admin-crypto'
import { adminDb, fail, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isLocked(ip)) return fail('Bohat zyada ghalat koshishen. 15 minute baad dobara try karein', 429)

    const body = await req.json().catch(() => ({}))
    const username = body?.username
    const password = body?.password
    if (
      typeof username !== 'string' || typeof password !== 'string' ||
      !username || !password || username.length > 100 || password.length > 200
    ) return fail('Username aur password likhein', 400)

    const rootUser = process.env.ADMIN_USER
    const rootPass = process.env.ADMIN_PASS
    if (!rootUser || !rootPass) throw new Error('ADMIN_USER / ADMIN_PASS missing')

    let session: Session | null = null
    const exp = Date.now() + SESSION_MS

    // evaluate both comparisons (no short-circuit) so timing does not leak which part was wrong
    const rootOk = safeEqual(username, rootUser) && safeEqual(password, rootPass)
    if (rootOk) {
      session = { u: rootUser, r: 'root', exp }
    } else {
      const { data, error } = await adminDb()
        .from('admin_accounts')
        .select('username,password_hash,blocked')
        .eq('username', username)
        .maybeSingle()
      if (error) throw error
      const ok = verifyPassword(password, data?.password_hash ?? DUMMY_HASH)
      if (data && ok) {
        if (data.blocked) return fail('Ye ID block hai', 403)
        session = { u: data.username, r: 'acct', exp }
      }
    }

    if (!session) {
      registerFail(ip)
      await sleep(500)
      return fail('Username ya password ghalat hai', 401)
    }

    clearFails(ip)
    const res = NextResponse.json({ ok: true, role: session.r === 'root' ? 'root' : 'user' })
    res.cookies.set(COOKIE, signSession(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: Math.floor(SESSION_MS / 1000),
    })
    return res
  } catch (e) {
    return serverError(e)
  }
}
