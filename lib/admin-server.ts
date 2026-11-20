// Server-only: Supabase (service role) client + session check for admin API routes.
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE, readSession, Session } from './admin-crypto'

export function adminDb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')
  const url = process.env.SUPABASE_URL || 'https://vwvhtrpapsbysmpemdle.supabase.co'
  return createClient(url, key, { auth: { persistSession: false } })
}

// Returns the session only if the cookie is valid AND (for created IDs) the ID still exists and is not blocked.
export async function getSession(req: NextRequest): Promise<Session | null> {
  const s = readSession(req.cookies.get(COOKIE)?.value)
  if (!s) return null
  if (s.r === 'acct') {
    const { data } = await adminDb().from('admin_accounts').select('blocked').eq('username', s.u).maybeSingle()
    if (!data || data.blocked) return null
  }
  return s
}

// IP + approximate place of the request (Vercel adds these headers automatically).
export function clientGeo(req: NextRequest) {
  const h = req.headers
  const dec = (v: string | null) => {
    if (!v) return null
    try { return decodeURIComponent(v) } catch { return v }
  }
  const num = (v: string | null) => {
    const n = v ? parseFloat(v) : NaN
    return Number.isFinite(n) ? n : null
  }
  return {
    ip: (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || null,
    city: dec(h.get('x-vercel-ip-city')),
    region: dec(h.get('x-vercel-ip-country-region')),
    country: dec(h.get('x-vercel-ip-country')),
    ip_lat: num(h.get('x-vercel-ip-latitude')),
    ip_lon: num(h.get('x-vercel-ip-longitude')),
  }
}

// A person counts as "online" if their page pinged within this time (page pings every 30s).
export const ONLINE_MS = 150 * 1000
export const isOnline = (s: { logout_at?: string | null; last_seen: string }) =>
  !s.logout_at && Date.now() - new Date(s.last_seen).getTime() < ONLINE_MS

export function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function serverError(e: unknown) {
  console.error('admin api error:', e)
  return fail('Server setup mukammal nahi (environment variables / Supabase table check karein)', 500)
}
