import { NextRequest, NextResponse } from 'next/server'
import { adminDb, fail, getSession, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET ?path=drivers/xxx.jpg -> a short-lived signed URL to view a private image
export async function GET(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const path = req.nextUrl.searchParams.get('path')
    if (!path || path.includes('..')) return fail('Path theek nahi', 400)
    const { data, error } = await adminDb().storage.from('driver-media').createSignedUrl(path, 300)
    if (error) throw error
    return NextResponse.json({ url: data.signedUrl })
  } catch (e) {
    return serverError(e)
  }
}
