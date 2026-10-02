'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface OtpFormProps {
  onVerify: (otp: string) => Promise<void>
  isLoading?: boolean
  onResend?: () => Promise<void>
}

export function OtpForm({ onVerify, isLoading, onResend }: OtpFormProps) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    try {
      setError('')
      await onVerify(otp)
    } catch (err) {
      setError('Invalid OTP. Please try again.')
      console.error(err)
    }
  }

  const handleResend = async () => {
    if (onResend) {
      setResendLoading(true)
      try {
        await onResend()
        setError('')
      } catch (err) {
        setError('Failed to resend OTP')
      } finally {
        setResendLoading(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter OTP
        </label>
        <Input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/[^0-9]/g, ''))
            setError('')
          }}
          className="text-center text-2xl tracking-widest"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleVerify}
        disabled={isLoading || otp.length !== 6}
        className="w-full"
      >
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {resendLoading ? 'Resending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  )
}
