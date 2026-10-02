'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function BookRidePage() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [distance, setDistance] = useState(0)
  const [fare, setFare] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const calculateFare = (dist: number) => {
    // Base fare: 50, Per km: 10, Commission: 20%
    const baseFare = 50
    const perKmFare = 10
    const commission = 0.2
    const totalFare = (baseFare + dist * perKmFare) * (1 - commission)
    return Math.round(totalFare)
  }

  const handleCalculateFare = () => {
    if (pickup && dropoff && distance > 0) {
      const calculatedFare = calculateFare(distance)
      setFare(calculatedFare)
    }
  }

  const handleBookRide = () => {
    if (pickup && dropoff && distance > 0) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        // Redirect to ride confirmation
      }, 2000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Book a Ride</h1>
        <Link href="/passenger/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Pickup Location
          </label>
          <Input
            type="text"
            placeholder="Enter pickup address"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>

        {/* Dropoff Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Dropoff Location
          </label>
          <Input
            type="text"
            placeholder="Enter dropoff address"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
          />
        </div>

        {/* Distance */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Distance (km)
          </label>
          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="Estimated distance"
            value={distance || ''}
            onChange={(e) => setDistance(Number(e.target.value))}
          />
        </div>

        {/* Calculate Fare Button */}
        <Button
          onClick={handleCalculateFare}
          className="w-full"
          variant="outline"
        >
          Calculate Fare
        </Button>

        {/* Fare Breakdown */}
        {fare > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-2 border border-blue-200">
            <h3 className="font-semibold text-gray-900">Fare Breakdown</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Base Fare</p>
                <p className="font-medium">Rs 50</p>
              </div>
              <div>
                <p className="text-gray-600">Distance Charge</p>
                <p className="font-medium">Rs {distance * 10}</p>
              </div>
              <div>
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">Rs {50 + distance * 10}</p>
              </div>
              <div>
                <p className="text-gray-600">After Commission</p>
                <p className="font-medium text-green-600">Rs {fare}</p>
              </div>
            </div>
          </div>
        )}

        {/* Book Ride Button */}
        <Button
          onClick={handleBookRide}
          disabled={fare === 0 || submitted}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
        >
          {submitted ? 'Searching for drivers...' : 'Book Ride'}
        </Button>

        {submitted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
            ✓ Ride requested successfully! Finding drivers nearby...
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> Enter your pickup and dropoff locations, provide an estimate of the distance,
          and we will calculate the fare for you. A driver will be assigned once you confirm the booking.
        </p>
      </div>
    </div>
  )
}
