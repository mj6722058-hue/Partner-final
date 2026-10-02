'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Patner
          </h1>
          <p className="text-xl text-gray-600">
            Modern Ride-Hailing Platform
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            The Future of Transportation
          </h2>
          <p className="text-gray-600 text-center text-lg mb-8">
            Patner connects drivers and passengers with a seamless, modern
            experience. Whether you&apos;re looking for a ride or want to earn
            money as a driver, Patner makes it easy.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="text-center">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                For Drivers
              </h3>
              <p className="text-gray-600">
                Earn money on your own schedule. Simple onboarding and real-time
                earnings tracking.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                For Passengers
              </h3>
              <p className="text-gray-600">
                Safe, reliable, and affordable rides at your fingertips. Book
                instantly and track in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Control
              </h3>
              <p className="text-gray-600">
                Manage drivers, monitor earnings, and control platform settings
                from one dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Get Started Today
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg">
                Sign In / Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>© 2024 Patner. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
