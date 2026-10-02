'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DriverDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Dashboard</h1>
        <p className="text-gray-600">Welcome back! Manage your rides and earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Status</p>
          <p className="text-2xl font-bold text-blue-600">Offline</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Rides</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Rating</p>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Earnings</p>
          <p className="text-2xl font-bold text-green-600">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/driver/documents">
            <Button variant="outline" className="w-full">
              Upload Documents
            </Button>
          </Link>
          <Link href="/driver/vehicle">
            <Button variant="outline" className="w-full">
              Add Vehicle
            </Button>
          </Link>
          <Link href="/driver/rides">
            <Button variant="outline" className="w-full">
              View Rides
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
