'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { OtpForm } from '@/components/auth/OtpForm'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendOTP, verifyOTP, createDriverProfile, createPassengerProfile } from '@/lib/auth'
import { UserRole } from '@/types'
import toast from 'react-hot-toast'

// Force deployment - Updated: 2026-07-27

type Stage = 'phone' | 'role' | 'otp' | 'details'

export default function LoginPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('phone')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole | null>(null)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOTP = async (phoneNumber: string) => {
    setIsLoading(true)
    try {
      const result = await sendOTP(phoneNumber)
      if (result.success) {
        setPhone(phoneNumber)
        setStage('otp')
        toast.success('OTP sent successfully')
      } else {
        toast.error('Failed to send OTP')
      }
    } catch (error) {
      toast.error('Error sending OTP')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRole = (selectedRole: UserRole) => {
    if (selectedRole === 'admin') {
      router.push('/auth/admin-login')
    } else {
      setRole(selectedRole)
      setStage('details')
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    setIsLoading(true)
    try {
      const result = await verifyOTP(phone, otp)
      if (result.success) {
        setStage('role')
        toast.success('OTP verified')
      } else {
        toast.error('Invalid OTP')
      }
    } catch (error) {
      toast.error('Error verifying OTP')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProfile = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    setIsLoading(true)
    try {
      if (role === 'driver') {
        const driverResult = await createDriverProfile('')
        if (driverResult.success) {
          toast.success('Driver profile created')
          router.push('/driver/dashboard')
        } else {
          toast.error('Failed to create driver profile')
        }
      } else if (role === 'passenger') {
        const passengerResult = await createPassengerProfile('')
        if (passengerResult.success) {
          toast.success('Passenger profile created')
          router.push('/passenger/dashboard')
        } else {
          toast.error('Failed to create passenger profile')
        }
      }
    } catch (error) {
      toast.error('Error creating profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Patner</h1>
            <p className="text-gray-600">Sign In or Create Account</p>
          </div>

          {stage === 'phone' && (
            <PhoneInput onSendOTP={handleSendOTP} isLoading={isLoading} />
          )}

          {stage === 'role' && (
            <RoleSelector onSelectRole={handleSelectRole} isLoading={isLoading} />
          )}

          {stage === 'otp' && (
            <OtpForm
              onVerify={handleVerifyOTP}
              isLoading={isLoading}
              onResend={() => handleSendOTP(phone)}
            />
          )}

          {stage === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCreateProfile}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
