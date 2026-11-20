import { NextRequest, NextResponse } from 'next/server'
import { adminDb, fail, getSession, isOnline, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET ?username=x&limit=20 -> login history of one ID (newest first). Main admin only.
export async function GET(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    if (s.r !== 'root') return fail('Sirf main admin dekh sakta hai', 403)
    const username = req.nextUrl.searchParams.get('username')
    if (!username) return fail('ID nahi di', 400)
    const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10) || 20, 1), 50)
    const { data, error } = await adminDb()
      .from('admin_sessions')
      .select('*')
      .eq('username', username)
      .order('login_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    const sessions = (data || []).map(({ id, user_agent, ...r }: any) => ({ ...r, online: isOnline(r) }))
    return NextResponse.json({ sessions })
  } catch (e) {
    return serverError(e)
  }
}
