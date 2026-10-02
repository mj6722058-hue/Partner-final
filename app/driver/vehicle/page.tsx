'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Vehicle {
  id: string
  model: string
  color: string
  plateNumber: string
  year: number
}

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      model: 'Honda Civic',
      color: 'White',
      plateNumber: 'HBC-123',
      year: 2022,
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    model: '',
    color: '',
    plateNumber: '',
    year: new Date().getFullYear(),
  })

  const handleAddVehicle = () => {
    if (formData.model && formData.color && formData.plateNumber) {
      setVehicles([
        ...vehicles,
        {
          id: String(vehicles.length + 1),
          ...formData,
        },
      ])
      setFormData({ model: '', color: '', plateNumber: '', year: new Date().getFullYear() })
      setShowForm(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
        <Link href="/driver/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Add Vehicle Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Registered Vehicles</h2>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              Add New Vehicle
            </Button>
          )}
        </div>

        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <Input
                type="text"
                placeholder="e.g., Honda Civic"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <Input
                type="text"
                placeholder="e.g., White"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
              <Input
                type="text"
                placeholder="e.g., HBC-123"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <Input
                type="number"
                min="2010"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddVehicle} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Save Vehicle
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Vehicles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-600">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-bold text-gray-900">{vehicle.model}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Color</p>
                  <p className="font-medium text-gray-900">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-medium text-gray-900">{vehicle.year}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plate Number</p>
                <p className="font-mono font-bold text-gray-900 text-lg">{vehicle.plateNumber}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
