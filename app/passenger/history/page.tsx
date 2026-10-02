'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Ride {
  id: string
  driver: string
  pickup: string
  dropoff: string
  fare: number
  date: string
  rating?: number
  status: 'completed' | 'cancelled'
}

const mockRides: Ride[] = [
  {
    id: '1',
    driver: 'Muhammad Hassan',
    pickup: 'DHA Lahore',
    dropoff: 'Mall of Lahore',
    fare: 425,
    date: '2024-07-24',
    rating: 5,
    status: 'completed',
  },
  {
    id: '2',
    driver: 'Ahmed Malik',
    pickup: 'Gulberg III',
    dropoff: 'Thokar Niaz Baig',
    fare: 320,
    date: '2024-07-23',
    rating: 4,
    status: 'completed',
  },
  {
    id: '3',
    driver: 'Fatima Khan',
    pickup: 'Airport',
    dropoff: 'Downtown',
    fare: 0,
    date: '2024-07-22',
    status: 'cancelled',
  },
  {
    id: '4',
    driver: 'Ali Raza',
    pickup: 'Saddar',
    dropoff: 'Cantonment',
    fare: 280,
    date: '2024-07-20',
    rating: 3,
    status: 'completed',
  },
]

export default function HistoryPage() {
  const [rides] = useState(mockRides)
  const [selectedRide, setSelectedRide] = useState<string | null>(null)
  const [ratingRide, setRatingRide] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleRateRide = (rideId: string) => {
    console.log(`Rating ride ${rideId} with ${rating} stars and comment: ${comment}`)
    setRatingRide(null)
    setRating(5)
    setComment('')
  }

  const totalSpent = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, ride) => sum + ride.fare, 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ride History</h1>
        <Link href="/passenger/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Rides</p>
          <p className="text-2xl font-bold text-gray-900">
            {rides.filter((r) => r.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-green-600">Rs {totalSpent}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Average Rating Given</p>
          <p className="text-2xl font-bold text-gray-900">
            {rides.filter((r) => r.rating).length > 0
              ? (
                  rides.reduce((sum, r) => sum + (r.rating || 0), 0) /
                  rides.filter((r) => r.rating).length
                ).toFixed(1)
              : '-'}
          </p>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-4">
        {rides.map((ride) => (
          <div
            key={ride.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Driver</p>
                <p className="font-semibold text-gray-900">{ride.driver}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{ride.date}</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ride.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ride.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Pickup</p>
                <p className="font-medium text-gray-900">{ride.pickup}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dropoff</p>
                <p className="font-medium text-gray-900">{ride.dropoff}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                {ride.rating && (
                  <p className="text-sm text-gray-600">
                    Your rating: <strong>{ride.rating} ⭐</strong>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <p className="font-bold text-lg text-gray-900">Rs {ride.fare}</p>
                {ride.status === 'completed' && !ride.rating && (
                  <Button
                    onClick={() => setRatingRide(ride.id)}
                    variant="outline"
                    className="text-sm"
                  >
                    Rate Ride
                  </Button>
                )}
              </div>
            </div>

            {/* Rating Form */}
            {ratingRide === ride.id && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-3 border border-blue-200">
                <p className="font-medium text-gray-900">Rate this ride</p>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Leave a comment (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  rows={3}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRateRide(ride.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                  >
                    Submit Rating
                  </Button>
                  <Button
                    onClick={() => setRatingRide(null)}
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
