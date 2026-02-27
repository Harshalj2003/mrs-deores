-- Add last_login_at column to users table for real-time active user tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
