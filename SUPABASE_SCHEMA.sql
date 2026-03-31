-- Supabase Database Schema for MCGI DRRT-RACS Attendance System
-- Run this in your Supabase SQL Editor

-- Create app_data table for storing application data
CREATE TABLE IF NOT EXISTS app_data (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table (optional - for better querying)
CREATE TABLE IF NOT EXISTS members (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    church_id TEXT UNIQUE NOT NULL,
    local TEXT,
    department TEXT,
    position TEXT,
    province TEXT,
    zone TEXT,
    age INTEGER,
    dob DATE,
    baptism DATE,
    phone TEXT,
    blood_type TEXT,
    skills TEXT,
    vehicle TEXT,
    email TEXT,
    password TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gatherings table
CREATE TABLE IF NOT EXISTS gatherings (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    local TEXT,
    venue TEXT,
    weather TEXT,
    attendances JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatherings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo - adjust for production)
CREATE POLICY "Allow all access" ON app_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON gatherings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON admin FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_app_data_updated_at BEFORE UPDATE ON app_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gatherings_updated_at BEFORE UPDATE ON gatherings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON admin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();