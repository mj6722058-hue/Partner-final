import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { adminDb, fail, getSession, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 6 * 1024 * 1024 // 6MB per image
const OK_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

// body: { dataUrl: "data:image/jpeg;base64,...." , folder?: "drivers" }
// Stores the file in the private driver-media bucket and returns its storage path
// (not a public URL — viewing it later goes through a short-lived signed URL).
export async function POST(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)

    const b = await req.json().catch(() => ({}))
    const m = typeof b?.dataUrl === 'string' ? b.dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/) : null
    if (!m) return fail('Tasveer theek format mein nahi hai', 400)
    const ext = OK_TYPES[m[1]]
    if (!ext) return fail('Sirf JPG, PNG ya WEBP tasveerein chalengi', 400)
    const buf = Buffer.from(m[2], 'base64')
    if (buf.length === 0 || buf.length > MAX_BYTES) return fail('Tasveer ka size 6MB se zyada nahi hona chahiye', 400)

    const folder = /^[a-z0-9_-]{1,40}$/i.test(b.folder || '') ? b.folder : 'misc'
    const path = `${folder}/${randomUUID()}.${ext}`
    const { error } = await adminDb().storage.from('driver-media').upload(path, buf, { contentType: m[1] })
    if (error) throw error
    return NextResponse.json({ path })
  } catch (e) {
    return serverError(e)
  }
}
