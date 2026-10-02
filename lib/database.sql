-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (built-in Supabase auth)
-- Use auth.users directly

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  photo_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'passenger')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'inactive', 'rejected')),
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  total_rides INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  vehicle_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Passengers table
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_rides INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  color TEXT NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cnic', 'license', 'registration')),
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rides table
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DECIMAL(9, 6) NOT NULL,
  pickup_lng DECIMAL(9, 6) NOT NULL,
  dropoff_lat DECIMAL(9, 6) NOT NULL,
  dropoff_lng DECIMAL(9, 6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled')),
  distance DECIMAL(8, 2),
  fare DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ride ratings table
CREATE TABLE ride_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_percentage DECIMAL(5, 2) DEFAULT 20,
  base_fare DECIMAL(10, 2) DEFAULT 50,
  per_km_fare DECIMAL(10, 2) DEFAULT 10,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for drivers
CREATE POLICY "Drivers can view their own data" ON drivers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own data" ON drivers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all drivers" ON drivers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update drivers" ON drivers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for passengers
CREATE POLICY "Passengers can view their own data" ON passengers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Passengers can update their own data" ON passengers
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for vehicles
CREATE POLICY "Drivers can view their own vehicles" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drivers WHERE id = driver_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their own vehicles" ON vehicles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drivers WHERE id = driver_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Drivers can view their own documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drivers WHERE id = driver_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can insert their own documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers WHERE id = driver_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update documents" ON documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for rides
CREATE POLICY "Users can view their own rides" ON rides
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM passengers WHERE id = passenger_id
    )
    OR
    auth.uid() IN (
      SELECT user_id FROM drivers WHERE id = driver_id
    )
  );

CREATE POLICY "Passengers can create rides" ON rides
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM passengers WHERE user_id = auth.uid() AND id = passenger_id
    )
  );

CREATE POLICY "Drivers can update ride status" ON rides
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drivers WHERE user_id = auth.uid() AND id = driver_id
    )
    OR
    EXISTS (
      SELECT 1 FROM passengers WHERE user_id = auth.uid() AND id = passenger_id
    )
  );

-- RLS Policies for chats
CREATE POLICY "Users can view their chats" ON chats
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create initial settings
INSERT INTO settings (id, commission_percentage, base_fare, per_km_fare)
  VALUES (uuid_generate_v4(), 20, 50, 10)
  ON CONFLICT DO NOTHING;
