'use client'

import { Suspense, FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState(() => searchParams.get('phone') ?? '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!phone.trim() || !/^\d{6}$/.test(otp)) {
      setError('Enter a valid phone number and 6 digit OTP.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP')
      }

      router.push('/dashboard')
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Verify OTP</h1>
          <p className="mt-1 text-sm text-slate-500">Enter the code sent to your phone.</p>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Phone number
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            inputMode="tel"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          6 digit OTP
          <input
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 tracking-[0.35em]"
            inputMode="numeric"
            maxLength={6}
            required
          />
        </label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50">
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </main>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">Loading...</main>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
