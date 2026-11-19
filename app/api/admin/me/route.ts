import { NextRequest, NextResponse } from 'next/server'
import { fail, getSession, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    return NextResponse.json({ ok: true, role: s.r === 'root' ? 'root' : 'user', username: s.u })
  } catch (e) {
    return serverError(e)
  }
}
