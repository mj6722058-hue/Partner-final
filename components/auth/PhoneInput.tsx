'use client'

import { useState } from 'react'
import PhoneNumberInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PhoneInputProps {
  onSendOTP: (phone: string) => Promise<void>
  isLoading?: boolean
}

export function PhoneInput({ onSendOTP, isLoading }: PhoneInputProps) {
  const [phone, setPhone] = useState<string>('')
  const [error, setError] = useState('')

  const handleSendOTP = async () => {
    if (!phone) {
      setError('Please enter a valid phone number')
      return
    }

    try {
      setError('')
      await onSendOTP(phone)
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <PhoneNumberInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="PK"
          value={phone}
          onChange={(value) => {
            setPhone(value || '')
            setError('')
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleSendOTP}
        disabled={isLoading || !phone}
        className="w-full"
      >
        {isLoading ? 'Sending...' : 'Send OTP'}
      </Button>
    </div>
  )
}
