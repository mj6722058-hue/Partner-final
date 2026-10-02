import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const { phone, otp } = await request.json()
    if (!phone || !otp) return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 })
    const { data, error } = await supabase.from('otp_codes').select('*').eq('phone', phone).eq('otp', otp).gt('expires_at', new Date().toISOString()).single()
    if (error || !data) return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    await supabase.from('otp_codes').delete().eq('id', data.id)
    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
