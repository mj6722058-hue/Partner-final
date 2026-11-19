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

export function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function serverError(e: unknown) {
  console.error('admin api error:', e)
  return fail('Server setup mukammal nahi (environment variables / Supabase table check karein)', 500)
}
