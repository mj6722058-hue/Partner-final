'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Ride {
  id: string
  passenger: string
  pickup: string
  dropoff: string
  distance: number
  fare: number
  status: 'pending' | 'completed' | 'cancelled'
  date: string
  rating?: number
}

const mockRides: Ride[] = [
  {
    id: '1',
    passenger: 'Ali Ahmed',
    pickup: 'DHA Lahore',
    dropoff: 'Mall of Lahore',
    distance: 8.5,
    fare: 425,
    status: 'completed',
    date: '2024-07-24',
    rating: 5,
  },
  {
    id: '2',
    passenger: 'Sara Khan',
    pickup: 'Gulberg III',
    dropoff: 'Thokar Niaz Baig',
    distance: 6.2,
    fare: 320,
    status: 'completed',
    date: '2024-07-23',
    rating: 4,
  },
  {
    id: '3',
    passenger: 'Hassan Ali',
    pickup: 'Airport',
    dropoff: 'Downtown',
    distance: 12,
    fare: 475,
    status: 'pending',
    date: '2024-07-24',
  },
]

export default function RidesPage() {
  const [rides] = useState(mockRides)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')

  const filteredRides = rides.filter((ride) => {
    if (filter === 'all') return true
    return ride.status === filter
  })

  const totalEarnings = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, ride) => sum + ride.fare, 0)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
        <Link href="/driver/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Rides</p>
          <p className="text-2xl font-bold text-gray-900">{rides.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Pending Rides</p>
          <p className="text-2xl font-bold text-blue-600">{rides.filter((r) => r.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600">Rs {totalEarnings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">
            {rides.filter((r) => r.rating).length > 0
              ? (rides.reduce((sum, r) => sum + (r.rating || 0), 0) / rides.filter((r) => r.rating).length).toFixed(1)
              : '-'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Passenger</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Route</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Distance</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fare</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRides.map((ride) => (
              <tr key={ride.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{ride.passenger}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {ride.pickup} → {ride.dropoff}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{ride.distance} km</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs {ride.fare}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ride.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : ride.status === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ride.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {ride.rating ? `${ride.rating} ⭐` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{ride.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
