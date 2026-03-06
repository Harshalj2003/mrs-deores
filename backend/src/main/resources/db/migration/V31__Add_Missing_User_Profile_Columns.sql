-- V31: Add missing user profile and account columns to users table
-- These columns were auto-created by Hibernate ddl-auto=update in dev
-- but are missing in production which uses ddl-auto=validate.

-- Profile fields (added for user profile setup flow)
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_pic_url VARCHAR(255);

-- Account status field (for account deletion / suspension)
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'ACTIVE';
