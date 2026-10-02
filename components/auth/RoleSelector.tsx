'use client'

import { Button } from '@/components/ui/button'
import { UserRole } from '@/types'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
  isLoading?: boolean
}

export function RoleSelector({ onSelectRole, isLoading }: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-gray-900">Select your role</p>

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={() => onSelectRole('driver')}
          disabled={isLoading}
          variant="outline"
          className="h-24 text-lg font-medium"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span>Driver</span>
          </div>
        </Button>

        <Button
          onClick={() => onSelectRole('passenger')}
          disabled={isLoading}
          variant="outline"
          className="h-24 text-lg font-medium"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">👤</span>
            <span>Passenger</span>
          </div>
        </Button>

        <Button
          onClick={() => onSelectRole('admin')}
          disabled={isLoading}
          variant="outline"
          className="h-24 text-lg font-medium"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <span>Admin</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
