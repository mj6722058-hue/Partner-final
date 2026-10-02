import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, '')
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('92')) return digits
  if (digits.startsWith('0')) return `92${digits.slice(1)}`
  return digits
}

export async function POST(request: NextRequest) {
  try {
    const { phone, token } = await request.json()
    const normalizedPhone = normalizePhone(phone || '')
    const otp = String(token || '').replace(/\D/g, '')

    if (!normalizedPhone || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: otpCode, error: lookupError } = await supabase
      .from('otp_codes')
      .select('id, otp, expires_at')
      .eq('phone', normalizedPhone)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lookupError) {
      console.error('[v0] Failed to look up WhatsApp OTP:', lookupError)
      return NextResponse.json({ error: 'Failed to verify WhatsApp OTP' }, { status: 500 })
    }

    if (!otpCode) return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })

    const { error: deleteError } = await supabase.from('otp_codes').delete().eq('id', otpCode.id)
    if (deleteError) console.error('[v0] Failed to delete used WhatsApp OTP:', deleteError)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error verifying WhatsApp OTP:', error)
    return NextResponse.json({ error: 'Failed to verify WhatsApp OTP' }, { status: 500 })
  }
}
