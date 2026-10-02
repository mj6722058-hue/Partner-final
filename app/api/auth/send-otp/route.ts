import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    console.log('Phone:', phone)
    await supabase.from('otp_codes').delete().eq('phone', phone)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated OTP:', otp, 'for', phone)
    const { error } = await supabase.from('otp_codes').insert({
      phone,
      otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    if (error) {
      console.log('Insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, otp })
  } catch (e: any) {
    console.log('Catch error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
