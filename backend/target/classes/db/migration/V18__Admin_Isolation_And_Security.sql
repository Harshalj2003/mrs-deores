-- Add admin isolation and session security fields to admin_invitations
ALTER TABLE admin_invitations ADD COLUMN username VARCHAR(20) UNIQUE;
ALTER TABLE admin_invitations ADD COLUMN password VARCHAR(120);
ALTER TABLE admin_invitations ADD COLUMN session_expires_at TIMESTAMP;
ALTER TABLE admin_invitations ADD COLUMN is_fully_enrolled BOOLEAN DEFAULT FALSE;

-- Cleanup existing admins from users table to ensure isolation
-- We identify them by their email matching a used invitation
-- Order of deletion matters to satisfy FK constraints

DELETE FROM custom_orders WHERE user_id IN (
    SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE)
);

-- Delete order items via cascade from orders (handled by DB)
DELETE FROM orders WHERE user_id IN (
    SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE)
);

DELETE FROM cart_items WHERE cart_id IN (
    SELECT id FROM carts WHERE user_id IN (SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE))
);

DELETE FROM carts WHERE user_id IN (
    SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE)
);

DELETE FROM wishlist_items WHERE wishlist_id IN (
    SELECT id FROM wishlists WHERE user_id IN (SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE))
);

DELETE FROM wishlists WHERE user_id IN (
    SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE)
);

DELETE FROM addresses WHERE user_id IN (
    SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE)
);

DELETE FROM user_roles WHERE user_id IN (
    SELECT id FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE)
);

DELETE FROM users WHERE email IN (SELECT email FROM admin_invitations WHERE used = TRUE);
