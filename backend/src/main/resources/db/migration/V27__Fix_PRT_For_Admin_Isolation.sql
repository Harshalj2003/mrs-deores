-- V27: Update password_reset_tokens to allow user_id to be NULL for admin isolation reset flow
-- And ensure admin_invitation_id is linked via FK if not already added.

ALTER TABLE password_reset_tokens ALTER COLUMN user_id DROP NOT NULL;

-- Remove the old NOT NULL constraint references if they exist as named constraints (Postgres handles ALTER COLUMN DROP NOT NULL without named constraint usually)

-- Ensure the admin_invitation_id column has a FK relationship to admin_invitations(id)
-- We check if the FK exists first (optional since this is a new column logic)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_prt_admin_invitation') THEN
        ALTER TABLE password_reset_tokens 
        ADD CONSTRAINT fk_prt_admin_invitation 
        FOREIGN KEY (admin_invitation_id) REFERENCES admin_invitations(id) ON DELETE CASCADE;
    END IF;
END $$;
