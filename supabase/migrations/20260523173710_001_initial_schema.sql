/*
  # Initial Database Schema for IKRAM Event Management
  
  1. Purpose
    Creates the foundation for a complete event management system with user authentication,
    event creation, and registration approval workflow.
  
  2. New Tables
    a) `profiles` - Stores user profile information
       - id (uuid, primary key, references auth.users)
       - nama (text, full name)
       - email (text, unique email address)
       - no_hp (text, phone number)
       - asal_institusi (text, optional institution)
       - role (text, default 'user' - can be 'user' or 'admin')
       - created_at (timestamp)
       - updated_at (timestamp)
    
    b) `events` - Event management table
       - id (uuid, primary key)
       - judul (text, event title)
       - deskripsi (text, event description)
       - tanggal (date, event date)
       - waktu (time, event time)
       - lokasi (text, event location)
       - kategori (text, event category)
       - kuota_peserta (integer, max participants)
       - poster (text, optional poster URL)
       - created_by (uuid, references profiles.id)
       - created_at (timestamp)
       - updated_at (timestamp)
    
    c) `registrations` - Event registration tracking
       - id (uuid, primary key)
       - event_id (uuid, references events.id)
       - user_id (uuid, references profiles.id)
       - alasan_mendaftar (text, optional reason)
       - status (text, default 'pending' - can be 'pending', 'approved', 'rejected')
       - created_at (timestamp)
       - updated_at (timestamp)
  
  3. Security
    - Enable RLS on all tables
    - User can read/write own profile
    - User can read all events
    - User can create own registrations
    - User can read own registrations
    - Admin can manage all events
    - Admin can manage all registrations
  
  4. Important Notes
    1. The profiles table uses auth.users as the base for authentication
    2. A trigger automatically creates a profile when a user signs up
    3. Row Level Security ensures users can only access their own data
    4. Admin users have elevated permissions to manage content
*/

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    no_hp TEXT NOT NULL,
    asal_institusi TEXT DEFAULT '',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    deskripsi TEXT DEFAULT '',
    tanggal DATE NOT NULL,
    waktu TIME NOT NULL,
    lokasi TEXT DEFAULT '',
    kategori TEXT DEFAULT 'workshop',
    kuota_peserta INTEGER DEFAULT 0,
    poster TEXT DEFAULT '',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    alasan_mendaftar TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_events_tanggal ON events(tanggal);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for events table
CREATE POLICY "Anyone can read events"
    ON events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can create events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update events"
    ON events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete events"
    ON events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for registrations table
CREATE POLICY "Users can view own registrations"
    ON registrations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
    ON registrations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create registrations"
    ON registrations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update registrations"
    ON registrations FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nama, email, no_hp, asal_institusi)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'no_hp', ''),
        COALESCE(NEW.raw_user_meta_data->>'asal_institusi', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_events_updated_at ON events;
CREATE TRIGGER handle_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_registrations_updated_at ON registrations;
CREATE TRIGGER handle_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample events
INSERT INTO events (judul, deskripsi, tanggal, waktu, lokasi, kategori, kuota_peserta) VALUES
('Workshop Leadership & Public Speaking', 'Tingkatkan skill kepemimpinan dan kemampuan berbicara di depan publik bersama mentor profesional.', '2024-06-25', '14:00', 'Aula Utama IKRAM, Jakarta', 'workshop', 50),
('Seminar Industri 4.0 & Entrepreneurship', 'Insight tentang dunia startup dan strategi bisnis di era digital', '2024-07-10', '15:00', 'Gedung Serbaguna, Jakarta', 'seminar', 100),
('Team Building & Outing IKRAM', 'Acara gathering untuk mempererat hubungan antar divisi', '2024-07-20', '08:00', 'Puncak, Bogor', 'outing', 80);
