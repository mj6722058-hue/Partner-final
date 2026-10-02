import { supabase } from './supabase/client'
import { UserRole } from '@/types'

export async function sendOTP(phone: string) {
  try {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to send OTP')
    return { success: true, data }
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error)
    return { success: false, error }
  }
}

export async function verifyOTP(phone: string, token: string) {
  try {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp: token }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Invalid OTP')
    return { success: true, data }
  } catch (error) {
    console.error('Error verifying WhatsApp OTP:', error)
    return { success: false, error }
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error
    return { success: true, user }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { success: false, user: null }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { success: true, profile: data }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { success: false, profile: null }
  }
}

export async function createUserProfile(
  userId: string,
  name: string,
  phone: string,
  email: string | null,
  role: UserRole
) {
  try {
    const { data, error } = await supabase.from('profiles').insert([
      {
        id: userId,
        name,
        phone,
        email: email || null,
        role,
      },
    ])

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return { success: false, error }
  }
}

export async function createDriverProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .insert([
        {
          user_id: userId,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error creating driver profile:', error)
    return { success: false, error }
  }
}

export async function createPassengerProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('passengers')
      .insert([
        {
          user_id: userId,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error creating passenger profile:', error)
    return { success: false, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error signing out:', error)
    return { success: false, error }
  }
}
