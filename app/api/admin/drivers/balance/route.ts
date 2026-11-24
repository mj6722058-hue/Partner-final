import { NextRequest, NextResponse } from 'next/server'
import { adminDb, fail, getSession, serverError } from '@/lib/admin-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET ?driverId=... -> current balance + transaction history for that driver
export async function GET(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const driverId = req.nextUrl.searchParams.get('driverId')
    if (!driverId) return fail('Driver ID nahi di', 400)

    const { data: drv, error: e1 } = await adminDb().from('drivers').select('balance').eq('id', driverId).maybeSingle()
    if (e1) throw e1
    if (!drv) return fail('Driver nahi mila', 404)

    const { data: tx, error: e2 } = await adminDb()
      .from('driver_transactions').select('id,ride_detail,percent,amount,type,created_at')
      .eq('driver_id', driverId).order('created_at', { ascending: false }).limit(200)
    if (e2) throw e2

    return NextResponse.json({ balance: drv.balance || 0, transactions: tx || [] })
  } catch (e) {
    return serverError(e)
  }
}

// POST { driverId, rideDetail, percent, amount, type:'debit'|'credit' }
// Records one ledger entry (a ride's commission deduction, or a manual top-up) and updates the driver's running balance.
// There is no real ride engine yet, so these entries are entered here by the admin until a driver app exists to send them automatically.
export async function POST(req: NextRequest) {
  try {
    const s = await getSession(req)
    if (!s) return fail('Login nahi hai', 401)
    const b = await req.json().catch(() => ({}))

    const driverId = typeof b.driverId === 'string' ? b.driverId : ''
    const rideDetail = typeof b.rideDetail === 'string' ? b.rideDetail.trim() : ''
    const percent = Number(b.percent) || 0
    const amount = Number(b.amount)
    const type = b.type === 'credit' ? 'credit' : 'debit'
    if (!driverId) return fail('Driver ID nahi di', 400)
    if (!rideDetail || rideDetail.length > 300) return fail('Ride ki detail likhein', 400)
    if (!(amount > 0) || amount > 10000000) return fail('Amount theek nahi', 400)
    if (percent < 0 || percent > 100) return fail('Percent theek nahi', 400)

    const { data: drv, error: e1 } = await adminDb().from('drivers').select('balance').eq('id', driverId).maybeSingle()
    if (e1) throw e1
    if (!drv) return fail('Driver nahi mila', 404)

    const current = Number(drv.balance || 0)
    const next = type === 'credit' ? current + amount : current - amount

    const { error: e2 } = await adminDb().from('driver_transactions').insert({
      driver_id: driverId, ride_detail: rideDetail, percent, amount, type,
    })
    if (e2) throw e2

    const { error: e3 } = await adminDb().from('drivers').update({ balance: next }).eq('id', driverId)
    if (e3) throw e3

    return NextResponse.json({ ok: true, balance: next })
  } catch (e) {
    return serverError(e)
  }
}
