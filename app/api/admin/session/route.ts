import { NextRequest, NextResponse } from 'next/server'
import { adminDb, clientGeo, fail, getSession, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Heartbeat: the logged-in page calls this every ~30s.
// Marks the ID as "online", refreshes the approximate place, and stores exact GPS if the person allowed it.
export async function POST(req: NextRequest) {
  try {
    const s = await getSession(req) // also returns null if the ID was blocked or deleted -> page logs out
    if (!s) return fail('Login nahi hai', 401)
    if (s.r !== 'acct' || !s.sid) return NextResponse.json({ ok: true })

    const b = await req.json().catch(() => ({}))
    const now = new Date().toISOString()
    const upd: Record<string, unknown> = { last_seen: now, ...clientGeo(req) }

    if (
      typeof b.lat === 'number' && typeof b.lon === 'number' &&
      Math.abs(b.lat) <= 90 && Math.abs(b.lon) <= 180
    ) {
      upd.gps_lat = b.lat
      upd.gps_lon = b.lon
      upd.gps_accuracy = typeof b.accuracy === 'number' && Number.isFinite(b.accuracy) ? b.accuracy : null
      upd.gps_at = now
    }
    if (['granted', 'denied', 'unavailable', 'pending'].includes(b.status)) upd.gps_status = b.status

    const { error } = await adminDb().from('admin_sessions').update(upd).eq('id', s.sid).eq('username', s.u)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverError(e)
  }
}
