import { z } from 'zod'

export const phoneSchema = z.string().min(10, 'Invalid phone number')

export const otpSchema = z.string().min(6, 'OTP must be 6 digits').max(6)

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

export const driverDocumentSchema = z.object({
  type: z.enum(['cnic', 'license', 'registration']),
  file: z.instanceof(File).refine((file) => file.size < 5 * 1024 * 1024, 'File size must be less than 5MB'),
})

export const vehicleSchema = z.object({
  model: z.string().min(2, 'Model is required'),
  color: z.string().min(2, 'Color is required'),
  plate_number: z.string().min(5, 'Plate number is required'),
})

export const bookRideSchema = z.object({
  pickup_location: z.string().min(5, 'Pickup location is required'),
  dropoff_location: z.string().min(5, 'Dropoff location is required'),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
  dropoff_lat: z.number(),
  dropoff_lng: z.number(),
})

export const rateRideSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export const settingsSchema = z.object({
  commission_percentage: z.number().min(0).max(100),
  base_fare: z.number().min(0),
  per_km_fare: z.number().min(0),
})
