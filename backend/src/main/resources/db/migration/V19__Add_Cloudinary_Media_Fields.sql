-- V19: Add Cloudinary media metadata fields to product_images and categories
-- These columns are nullable for backward compatibility with existing image_url rows.

ALTER TABLE product_images ADD COLUMN IF NOT EXISTS public_id VARCHAR(255);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50) DEFAULT 'image';

ALTER TABLE categories ADD COLUMN IF NOT EXISTS public_id VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50) DEFAULT 'image';
