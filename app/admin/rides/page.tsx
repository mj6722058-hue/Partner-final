'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Ride {
  id: string
  passenger: string
  driver: string
  pickup: string
  dropoff: string
  status: 'completed' | 'in_progress' | 'cancelled'
  fare: number
  commission: number
  date: string
}

const mockRides: Ride[] = [
  {
    id: '1',
    passenger: 'Ali Ahmed',
    driver: 'Muhammad Hassan',
    pickup: 'DHA Lahore',
    dropoff: 'Mall of Lahore',
    status: 'completed',
    fare: 450,
    commission: 90,
    date: '2024-07-24',
  },
  {
    id: '2',
    passenger: 'Sara Khan',
    driver: 'Ahmad Malik',
    pickup: 'Gulberg III',
    dropoff: 'Thokar Niaz Baig',
    status: 'completed',
    fare: 320,
    commission: 64,
    date: '2024-07-24',
  },
  {
    id: '3',
    passenger: 'Hassan Ali',
    driver: 'Fatima Khan',
    pickup: 'Airport',
    dropoff: 'Downtown',
    status: 'cancelled',
    fare: 0,
    commission: 0,
    date: '2024-07-23',
  },
]

export default function RidesPage() {
  const [rides] = useState(mockRides)
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'cancelled'>('all')

  const filteredRides = rides.filter((ride) => {
    if (filter === 'all') return true
    return ride.status === filter
  })

  const totalEarnings = filteredRides.reduce((sum, ride) => sum + ride.commission, 0)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Rides</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Rides</p>
          <p className="text-2xl font-bold text-gray-900">{filteredRides.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Fares</p>
          <p className="text-2xl font-bold text-gray-900">
            Rs {filteredRides.reduce((sum, ride) => sum + ride.fare, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Commission Earned</p>
          <p className="text-2xl font-bold text-green-600">Rs {totalEarnings}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'completed', 'in_progress', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Passenger</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Driver</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Route</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fare</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Commission</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRides.map((ride) => (
              <tr key={ride.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">#{ride.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{ride.passenger}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{ride.driver}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {ride.pickup} → {ride.dropoff}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ride.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : ride.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ride.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">Rs {ride.fare}</td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">Rs {ride.commission}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{ride.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
