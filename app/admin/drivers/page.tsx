'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Driver {
  id: string
  name: string
  phone: string
  status: 'pending_verification' | 'active' | 'rejected'
  vehicle?: string
  rating: number
  rides: number
}

const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'Ahmed Ali',
    phone: '+923001234567',
    status: 'pending_verification',
    vehicle: 'Honda Civic White',
    rating: 0,
    rides: 0,
  },
  {
    id: '2',
    name: 'Muhammad Hassan',
    phone: '+923009876543',
    status: 'active',
    vehicle: 'Toyota Corolla Silver',
    rating: 4.8,
    rides: 156,
  },
  {
    id: '3',
    name: 'Fatima Khan',
    phone: '+923005555555',
    status: 'rejected',
    vehicle: 'Suzuki Alto Red',
    rating: 0,
    rides: 0,
  },
]

export default function DriversPage() {
  const [drivers] = useState(mockDrivers)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all')

  const filteredDrivers = drivers.filter((driver) => {
    if (filter === 'all') return true
    return driver.status === filter
  })

  const handleApprove = (driverId: string) => {
    console.log('Approving driver:', driverId)
  }

  const handleReject = (driverId: string) => {
    console.log('Rejecting driver:', driverId)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'active', 'rejected'] as const).map((status) => (
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

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vehicle</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rides</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{driver.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{driver.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{driver.vehicle || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : driver.status === 'pending_verification'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {driver.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {driver.rating > 0 ? `${driver.rating} ⭐` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{driver.rides}</td>
                <td className="px-6 py-4 text-sm">
                  {driver.status === 'pending_verification' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(driver.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(driver.id)}
                        variant="outline"
                        className="px-3 py-1 text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {driver.status === 'active' && (
                    <Button variant="outline" className="px-3 py-1 text-xs">
                      View Details
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
