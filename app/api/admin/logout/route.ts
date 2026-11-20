import { NextRequest, NextResponse } from 'next/server'
import { COOKIE, readSession } from '@/lib/admin-crypto'
import { adminDb } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // note the logout time (best effort, never blocks the logout)
  try {
    const s = readSession(req.cookies.get(COOKIE)?.value)
    if (s?.sid) {
      await adminDb()
        .from('admin_sessions')
        .update({ logout_at: new Date().toISOString() })
        .eq('id', s.sid)
        .is('logout_at', null)
    }
  } catch (e) {
    console.error('logout log failed', e)
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
