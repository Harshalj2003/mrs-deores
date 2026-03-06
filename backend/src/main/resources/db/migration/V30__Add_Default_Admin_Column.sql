-- V30: Add is_default_admin column to admin_invitations table
-- This column tracks which admin holds the "Default Admin" position,
-- granting them exclusive rights to invite/delete other admins.

ALTER TABLE admin_invitations
    ADD COLUMN IF NOT EXISTS is_default_admin BOOLEAN DEFAULT FALSE;
