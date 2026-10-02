'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [commission, setCommission] = useState(20)
  const [baseFare, setBaseFare] = useState(50)
  const [perKmFare, setPerKmFare] = useState(10)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    console.log('Settings saved:', { commission, baseFare, perKmFare })
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="space-y-6">
          {/* Commission Setting */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Commission Percentage (%)
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                max="100"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-32"
              />
              <p className="text-gray-600">
                Platform takes <strong>{commission}%</strong> of each ride fare
              </p>
            </div>
          </div>

          {/* Base Fare Setting */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Base Fare (Rs)
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                value={baseFare}
                onChange={(e) => setBaseFare(Number(e.target.value))}
                className="w-32"
              />
              <p className="text-gray-600">
                Minimum fare for each ride: <strong>Rs {baseFare}</strong>
              </p>
            </div>
          </div>

          {/* Per KM Fare Setting */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Per Kilometer Fare (Rs)
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                value={perKmFare}
                onChange={(e) => setPerKmFare(Number(e.target.value))}
                className="w-32"
              />
              <p className="text-gray-600">
                Charge per km: <strong>Rs {perKmFare}</strong>
              </p>
            </div>
          </div>

          {/* Fare Calculation Example */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-3">Example Fare Calculation:</p>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Base Fare: Rs {baseFare}</p>
              <p>• 10 km ride: Rs {baseFare + 10 * perKmFare}</p>
              <p>• After commission ({commission}%): Rs {Math.round((baseFare + 10 * perKmFare) * (1 - commission / 100))}</p>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 mt-6">
            Save Settings
          </Button>

          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✓ Settings saved successfully
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
