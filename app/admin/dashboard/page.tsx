'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform management and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Drivers</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Passengers</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Rides</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Platform Earnings</p>
          <p className="text-2xl font-bold text-green-600">$0.00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/drivers">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Drivers</h3>
            <p className="text-gray-600 text-sm mb-4">Review and approve driver applications</p>
            <Button className="w-full">View Drivers</Button>
          </div>
        </Link>

        <Link href="/admin/rides">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">View Rides</h3>
            <p className="text-gray-600 text-sm mb-4">Monitor all platform rides and earnings</p>
            <Button className="w-full">View Rides</Button>
          </div>
        </Link>

        <Link href="/admin/settings">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 text-sm mb-4">Configure commission and fare rates</p>
            <Button className="w-full">Settings</Button>
          </div>
        </Link>
      </div>
    </div>
  )
}
