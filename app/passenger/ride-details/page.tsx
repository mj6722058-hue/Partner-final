'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapComponent } from '@/components/maps/MapComponent'

export default function RideDetailsPage() {
  const [rideStatus, setRideStatus] = useState<'requested' | 'accepted' | 'arrived' | 'in_progress' | 'completed'>(
    'in_progress'
  )
  const [driverLocation] = useState({ lat: 31.5204, lng: 74.3587 })
  const [pickupLocation] = useState({ lat: 31.5497, lng: 74.3436 })
  const [dropoffLocation] = useState({ lat: 31.4644, lng: 74.2663 })

  const statusSteps = [
    { status: 'requested', label: 'Ride Requested', icon: '📱' },
    { status: 'accepted', label: 'Driver Accepted', icon: '👤' },
    { status: 'arrived', label: 'Driver Arrived', icon: '🚗' },
    { status: 'in_progress', label: 'Ride in Progress', icon: '🛣️' },
    { status: 'completed', label: 'Completed', icon: '✓' },
  ]

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((s) => s.status === rideStatus)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Map */}
      <div className="h-96 bg-white">
        <MapComponent
          pickupLat={pickupLocation.lat}
          pickupLng={pickupLocation.lng}
          dropoffLat={dropoffLocation.lat}
          dropoffLng={dropoffLocation.lng}
          height="100%"
        />
      </div>

      {/* Ride Details */}
      <div className="max-w-2xl mx-auto p-6 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Driver Info */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Muhammad Hassan</h2>
                <p className="text-gray-600 text-sm">Rating: 4.8 ⭐ (156 rides)</p>
              </div>
              <div className="text-3xl">🚗</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Vehicle</p>
                <p className="font-medium text-gray-900">Toyota Corolla</p>
              </div>
              <div>
                <p className="text-gray-600">Plate</p>
                <p className="font-mono font-bold text-gray-900">HBC-123</p>
              </div>
            </div>
          </div>

          {/* Ride Status Timeline */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Ride Status</h3>
            <div className="space-y-3">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= getCurrentStepIndex()
                const isCurrent = step.status === rideStatus
                return (
                  <div key={step.status} className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        isCompleted
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          isCurrent ? 'text-blue-600 font-bold' : 'text-gray-900'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ride Details */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold text-gray-900 mb-4">Trip Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Pickup</p>
                <p className="font-medium text-gray-900">DHA Phase 5, Lahore</p>
              </div>
              <div>
                <p className="text-gray-600">Dropoff</p>
                <p className="font-medium text-gray-900">Mall of Lahore</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Distance</p>
                  <p className="font-medium text-gray-900">8.5 km</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Time</p>
                  <p className="font-medium text-gray-900">22 mins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fare Details */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Fare</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-600">Base Fare</p>
                <p className="font-medium">Rs 50</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Distance (8.5 km)</p>
                <p className="font-medium">Rs 85</p>
              </div>
              <div className="flex justify-between border-t pt-2">
                <p className="font-bold text-gray-900">Total Fare</p>
                <p className="font-bold text-lg text-gray-900">Rs 425</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 py-6">
              Call Driver
            </Button>
            <Button variant="outline" className="flex-1 py-6">
              Chat
            </Button>
            {rideStatus === 'completed' && (
              <Link href="/passenger/history" className="flex-1">
                <Button className="w-full py-6">Rate Ride</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
