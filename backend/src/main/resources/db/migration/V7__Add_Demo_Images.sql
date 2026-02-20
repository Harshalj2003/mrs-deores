-- Add demo images for initial products
-- Link existing products by name to their Unsplash demo images

-- 1. Puran Poli Premix
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80', TRUE
FROM products WHERE name = 'Puran Poli Premix' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id);

-- 2. Ukadiche Modak Flour
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?auto=format&fit=crop&w=800&q=80', TRUE
FROM products WHERE name = 'Ukadiche Modak Flour' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id);

-- 3. Ladoo Masala
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80', TRUE
FROM products WHERE name = 'Ladoo Masala' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id);

-- 4. Besan Ladoo Premix
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1541944743827-e04bb645f946?auto=format&fit=crop&w=800&q=80', TRUE
FROM products WHERE name = 'Besan Ladoo Premix' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id);
