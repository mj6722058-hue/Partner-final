'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PassengerDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Passenger Dashboard</h1>
        <p className="text-gray-600">Ready to book a ride?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Rides</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-green-600">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/passenger/book-ride">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Book a Ride
            </Button>
          </Link>
          <Link href="/passenger/history">
            <Button variant="outline" className="w-full">
              Ride History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
