-- V28: Add Email Verification support
-- Add is_email_verified column to users table
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;

-- Create email_verification_otps table to store OTP codes
CREATE TABLE email_verification_otps (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    otp_code VARCHAR(4) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    attempts_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster cleanup and lookup
CREATE INDEX idx_ev_otp_email ON email_verification_otps(email);
