import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function POST(req: NextRequest){
  try{
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { phone } = await req.json()
    const cleanPhone = phone.replace(/\D/g, '')
    await supabase.from('otp_codes').delete().eq('phone', cleanPhone)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log("OTP:", otp, "for", cleanPhone)
    await supabase.from('otp_codes').insert({ phone: cleanPhone, otp, expires_at: new Date(Date.now()+300000).toISOString() })
    return NextResponse.json({ success: true, otp: otp })
  }catch(e:any){
    return NextResponse.json({ error: e.message }, {status:500})
  }
}
