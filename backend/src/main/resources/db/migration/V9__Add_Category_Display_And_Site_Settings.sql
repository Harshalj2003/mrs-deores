-- V9: Add category display fields and create site_settings table

-- 1. Add new display/layout columns to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS grid_size VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS view_mode VARCHAR(20) DEFAULT 'AUTO';

-- 2. Create site_settings table for dynamic contact info, social links, and our story content
CREATE TABLE IF NOT EXISTS site_settings (
    id          BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Seed default contact information values
INSERT INTO site_settings (setting_key, setting_value) VALUES
    ('contact_address', 'Plot No. 21, ZP Colony, Near Dutt Mandir Chowk, Deopur, Dhule 424005'),
    ('contact_email', 'contact@mrsdeore.com'),
    ('contact_phone', '+91 98765 43210'),
    ('social_facebook', ''),
    ('social_instagram', ''),
    ('social_linkedin', ''),
    ('social_twitter', ''),
    ('story_title', 'Our Story'),
    ('story_tagline', 'Made with love, served with tradition.'),
    ('story_description', ''),
    ('story_chapters', '[]')
ON CONFLICT (setting_key) DO NOTHING;
