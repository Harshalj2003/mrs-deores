-- V29: Enhance OTP Rate Limiting
-- Add resend tracking columns to email_verification_otps
ALTER TABLE email_verification_otps ADD COLUMN resend_count INT DEFAULT 1;
ALTER TABLE email_verification_otps ADD COLUMN last_resend_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
