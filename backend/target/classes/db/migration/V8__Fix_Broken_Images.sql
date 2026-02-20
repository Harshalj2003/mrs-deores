-- Fix broken/unreliable demo images by updating them to use Placehold.co
-- This ensures they load correctly in the browser for verification

UPDATE product_images 
SET image_url = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Puran+Poli' 
WHERE product_id IN (SELECT id FROM products WHERE name = 'Puran Poli Premix');

UPDATE product_images 
SET image_url = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Modak+Flour' 
WHERE product_id IN (SELECT id FROM products WHERE name = 'Ukadiche Modak Flour');

UPDATE product_images 
SET image_url = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Ladoo+Masala' 
WHERE product_id IN (SELECT id FROM products WHERE name = 'Ladoo Masala');

UPDATE product_images 
SET image_url = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Besan+Ladoo' 
WHERE product_id IN (SELECT id FROM products WHERE name = 'Besan Ladoo Premix');
