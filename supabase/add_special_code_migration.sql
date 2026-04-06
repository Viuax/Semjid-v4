-- Migration to add special_code column to bookings table
-- Run this in Supabase SQL Editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_code TEXT;