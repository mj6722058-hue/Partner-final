# Patner - Ride-Hailing Platform

A modern, full-stack ride-hailing platform built with Next.js 16, Supabase, and Tailwind CSS.

## Overview

Patner is a comprehensive ride-hailing application designed to connect drivers and passengers seamlessly. The platform includes three main panels:

- **Admin Panel**: Manage drivers, monitor rides, configure commission rates, and analytics
- **Driver Panel**: Upload documents, manage vehicles, accept rides, track earnings
- **Passenger Panel**: Book rides, track driver location, rate drivers, view history

## Features

### Core Features
- Phone-based OTP authentication for drivers and passengers
- Email authentication for admin access
- Real-time ride booking and tracking
- Driver document verification system
- Vehicle management for drivers
- Fare calculation system
- Ride rating and feedback system
- Platform earnings and commission management

### Technology Stack
- **Frontend**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Phone OTP
- **UI Components**: shadcn/ui with Tailwind CSS
- **Maps**: Leaflet for location display
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Notifications**: React Hot Toast

## Project Structure

```
patner/
├── app/
│   ├── (root)
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── auth/
│   │   └── login/page.tsx           # Authentication flow
│   ├── driver/
│   │   ├── dashboard/page.tsx       # Driver home
│   │   ├── documents/page.tsx       # Document upload
│   │   ├── vehicle/page.tsx         # Vehicle management
│   │   └── rides/page.tsx           # Ride history
│   ├── passenger/
│   │   ├── dashboard/page.tsx       # Passenger home
│   │   ├── book-ride/page.tsx       # Book a ride
│   │   ├── ride-details/page.tsx    # Active ride tracking
│   │   ├── history/page.tsx         # Ride history & ratings
│   │   └── profile/page.tsx         # Profile management
│   ├── admin/
│   │   ├── dashboard/page.tsx       # Admin home
│   │   ├── drivers/page.tsx         # Driver management
│   │   ├── rides/page.tsx           # Ride monitoring
│   │   └── settings/page.tsx        # Commission & fare settings
│   └── api/
│       ├── auth/
│       │   ├── send-otp/route.ts
│       │   └── verify-otp/route.ts
│       ├── drivers/route.ts
│       ├── passengers/route.ts
│       └── rides/route.ts
├── components/
│   ├── ui/                          # shadcn components
│   ├── auth/
│   │   ├── PhoneInput.tsx
│   │   ├── OtpForm.tsx
│   │   └── RoleSelector.tsx
│   ├── driver/
│   │   ├── DocumentUpload.tsx
│   │   ├── VehicleForm.tsx
│   │   └── RideAccept.tsx
│   ├── passenger/
│   │   ├── BookRideForm.tsx
│   │   ├── FareEstimate.tsx
│   │   └── RideCard.tsx
│   ├── admin/
│   │   ├── DriverApproval.tsx
│   │   └── CommissionSettings.tsx
│   ├── maps/
│   │   └── MapComponent.tsx
│   └── common/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── ProtectedRoute.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth.ts
│   ├── validators.ts
│   ├── utils.ts
│   └── database.sql
├── types/
│   └── index.ts
├── middleware.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

## Database Schema

The application uses PostgreSQL through Supabase with Row Level Security (RLS) enabled for data protection.

### Tables
- **auth.users**: Supabase built-in authentication
- **profiles**: User profile information (name, phone, email, role)
- **drivers**: Driver-specific data (status, earnings, rating)
- **passengers**: Passenger-specific data (ratings, total rides)
- **vehicles**: Vehicle details for drivers
- **documents**: Driver documents (CNIC, License, Registration)
- **rides**: Ride bookings and history
- **ride_ratings**: Driver ratings from passengers
- **settings**: Platform configuration (commission, fares)
- **chats**: Real-time messaging between driver and passenger

See `lib/database.sql` for complete schema and RLS policies.

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account and project
- Environment variables configured

### Installation

1. **Clone and install dependencies**
```bash
npm install
# or
pnpm install
```

2. **Set up environment variables**
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Initialize database**
- Go to Supabase SQL Editor
- Copy and run the SQL from `lib/database.sql`

4. **Run development server**
```bash
npm run dev
# Server runs at http://localhost:3000
```

## Key Pages

### Landing Page
- Overview of the platform
- Links to authentication
- Feature highlights

### Authentication
- Phone number input with country selector
- OTP verification
- Role selection (Driver/Passenger/Admin)
- User profile creation

### Admin Dashboard
- Platform statistics (total drivers, passengers, rides, earnings)
- Driver management and approval
- Ride monitoring
- Commission and fare configuration

### Driver Dashboard
- Status (Online/Offline)
- Earnings and ride statistics
- Document upload and verification
- Vehicle management
- Ride acceptance and history

### Passenger Dashboard
- Quick ride booking
- Ride history with ratings
- Driver ratings and feedback
- Profile management

## Fare Calculation

**Formula**: `(Base Fare + Distance × Per-km Rate) × (1 - Commission %)`

**Default Values**:
- Base Fare: Rs 50
- Per-km Rate: Rs 10
- Commission: 20%

**Example**: For a 10 km ride:
- Subtotal: 50 + (10 × 10) = Rs 150
- After 20% commission: 150 × 0.80 = Rs 120

Admins can modify these settings in the Settings page.

## Authentication Flow

### Phone OTP (Driver/Passenger)
1. User enters phone number
2. OTP sent to phone
3. User verifies OTP
4. User selects role and creates profile
5. Redirected to respective dashboard

### Email Auth (Admin)
- Separate admin login flow
- Email-based authentication

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and create user

### Drivers
- `GET /api/drivers` - List drivers (admin only)
- `GET /api/drivers/[id]` - Get driver details
- `POST /api/drivers` - Create driver profile
- `PATCH /api/drivers/[id]` - Update driver info

### Passengers
- `GET /api/passengers/[id]` - Get passenger profile
- `POST /api/passengers` - Create passenger profile

### Rides
- `GET /api/rides` - List rides
- `POST /api/rides` - Create new ride request
- `PATCH /api/rides/[id]` - Update ride status
- `POST /api/rides/[id]/rate` - Rate driver

### Admin
- `GET /api/admin/drivers` - List all drivers
- `POST /api/admin/drivers/[id]/approve` - Approve driver
- `PATCH /api/admin/settings` - Update settings

## Security

- Row Level Security (RLS) on all tables
- Phone OTP verification
- Email-based admin authentication
- Protected API routes
- Parameterized queries (SQL injection prevention)
- Input validation with Zod

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Vercel project**
- Connect GitHub repository
- Add environment variables

3. **Deploy**
```bash
vercel
```

## Future Enhancements

- Real-time ride tracking with WebSockets
- Payment integration (Stripe/JazzCash)
- In-app messaging with WebRTC
- Push notifications
- Driver ratings analytics
- Ride surge pricing
- Multiple payment methods
- Admin reports and exports
- Mobile app (React Native)

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact support team

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Leaflet](https://leafletjs.com)
- [Vercel](https://vercel.com)

---

**Patner** - Connecting Drivers and Passengers Seamlessly
