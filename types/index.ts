export type UserRole = 'admin' | 'driver' | 'passenger'

export interface User {
  id: string
  phone?: string
  email?: string
  role: UserRole
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  user_id: string
  status: 'pending_verification' | 'active' | 'inactive' | 'rejected'
  total_earnings: number
  total_rides: number
  average_rating: number
  vehicle_id?: string
  created_at: string
  updated_at: string
}

export interface Passenger {
  id: string
  user_id: string
  total_rides: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  driver_id: string
  model: string
  color: string
  plate_number: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  driver_id: string
  type: 'cnic' | 'license' | 'registration'
  file_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Ride {
  id: string
  passenger_id: string
  driver_id?: string
  pickup_location: string
  dropoff_location: string
  pickup_lat: number
  pickup_lng: number
  dropoff_lat: number
  dropoff_lng: number
  status: 'requested' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
  distance: number
  fare: number
  created_at: string
  updated_at: string
}

export interface RideRating {
  id: string
  ride_id: string
  passenger_id: string
  driver_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface Settings {
  id: string
  commission_percentage: number
  base_fare: number
  per_km_fare: number
  updated_at: string
}

export interface Chat {
  id: string
  ride_id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
}
