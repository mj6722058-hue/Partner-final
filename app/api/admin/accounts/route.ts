import { NextRequest, NextResponse } from 'next/server'
import { decryptText, encryptText, hashPassword } from '@/lib/admin-crypto'
import { adminDb, fail, getSession, isOnline, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Only the main admin (ADMIN_USER) may manage IDs.
async function rootOnly(req: NextRequest) {
  const s = await getSession(req)
  if (!s) return { err: fail('Login nahi hai', 401), s: null }
  if (s.r !== 'root') return { err: fail('Sirf main admin IDs manage kar sakta hai', 403), s: null }
  return { err: null, s }
}

const validUsername = (u: unknown): u is string =>
  typeof u === 'string' && u.trim().length >= 3 && u.trim().length <= 50
const validPassword = (p: unknown): p is string =>
  typeof p === 'string' && p.length >= 8 && p.length <= 100

// GET            -> list of IDs (no passwords)
// GET ?reveal=x  -> password of ID x (for the eye icon)
export async function GET(req: NextRequest) {
  try {
    const { err } = await rootOnly(req)
    if (err) return err
    const reveal = req.nextUrl.searchParams.get('reveal')
    if (reveal) {
      const { data, error } = await adminDb().from('admin_accounts').select('password_enc').eq('username', reveal).maybeSingle()
      if (error) throw error
      if (!data) return fail('ID nahi mili', 404)
      return NextResponse.json({ password: decryptText(data.password_enc) })
    }
    const { data, error } = await adminDb()
      .from('admin_accounts')
      .select('username,blocked,created_at')
      .order('created_at', { ascending: true })
    if (error) throw error

    // attach activity (online / login time / device / location) from the newest session of each ID
    let tracking = true
    let sessions: any[] = []
    const names = (data || []).map((a: any) => a.username)
    if (names.length) {
      const r = await adminDb()
        .from('admin_sessions')
        .select('*')
        .in('username', names)
        .order('login_at', { ascending: false })
        .limit(500)
      if (r.error) {
        tracking = false // table not created yet
        console.error('admin_sessions missing? run lib/admin_sessions.sql', r.error)
      } else sessions = r.data || []
    }
    const accounts = (data || []).map((a: any) => {
      const mine = sessions.filter((x) => x.username === a.username)
      const live = mine.filter((x) => isOnline(x)).sort((x, y) => (x.last_seen < y.last_seen ? 1 : -1))[0]
      const show = live || mine[0]
      let activity: any = null
      if (show) {
        const { id, user_agent, username, ...rest } = show
        activity = { ...rest, online: !!live }
      }
      return { ...a, activity }
    })
    return NextResponse.json({ accounts, tracking })
  } catch (e) {
    return serverError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { err } = await rootOnly(req)
    if (err) return err
    const b = await req.json().catch(() => ({}))
    if (!validUsername(b.username)) return fail('Username 3 se 50 harf ka hona chahiye', 400)
    if (!validPassword(b.password)) return fail('Password kam az kam 8 characters ka hona chahiye', 400)
    const username = b.username.trim()
    if (process.env.ADMIN_USER && username === process.env.ADMIN_USER) return fail('Ye username istemal nahi ho sakta', 409)
    const { error } = await adminDb().from('admin_accounts').insert({
      username,
      password_hash: hashPassword(b.password),
      password_enc: encryptText(b.password),
    })
    if (error) {
      if ((error as any).code === '23505') return fail('Ye username pehle se maujood hai', 409)
      throw error
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverError(e)
  }
}

// body: { username, newUsername?, newPassword?, blocked? }
export async function PATCH(req: NextRequest) {
  try {
    const { err } = await rootOnly(req)
    if (err) return err
    const b = await req.json().catch(() => ({}))
    if (typeof b.username !== 'string' || !b.username) return fail('ID nahi di', 400)
    const update: Record<string, unknown> = {}
    if (b.newUsername !== undefined && b.newUsername !== b.username) {
      if (!validUsername(b.newUsername)) return fail('Username 3 se 50 harf ka hona chahiye', 400)
      if (process.env.ADMIN_USER && b.newUsername.trim() === process.env.ADMIN_USER) return fail('Ye username istemal nahi ho sakta', 409)
      update.username = b.newUsername.trim()
    }
    if (b.newPassword) {
      if (!validPassword(b.newPassword)) return fail('Password kam az kam 8 characters ka hona chahiye', 400)
      update.password_hash = hashPassword(b.newPassword)
      update.password_enc = encryptText(b.newPassword)
    }
    if (typeof b.blocked === 'boolean') update.blocked = b.blocked
    if (Object.keys(update).length === 0) return fail('Kuch change nahi kiya', 400)
    const { data, error } = await adminDb().from('admin_accounts').update(update).eq('username', b.username).select('username')
    if (error) {
      if ((error as any).code === '23505') return fail('Ye username pehle se maujood hai', 409)
      throw error
    }
    if (!data || data.length === 0) return fail('ID nahi mili', 404)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverError(e)
  }
}

// body: { username }
export async function DELETE(req: NextRequest) {
  try {
    const { err } = await rootOnly(req)
    if (err) return err
    const b = await req.json().catch(() => ({}))
    if (typeof b.username !== 'string' || !b.username) return fail('ID nahi di', 400)
    const { error } = await adminDb().from('admin_accounts').delete().eq('username', b.username)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverError(e)
  }
}
