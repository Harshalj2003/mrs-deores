-- V27: Update password_reset_tokens to allow user_id to be NULL for admin isolation reset flow
-- And ensure admin_invitation_id is linked via FK if not already added.

-- Step 1: Add the column if it doesn't exist
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS admin_invitation_id BIGINT;

-- Step 2: Allow user_id to be NULL (for admin-only tokens)
ALTER TABLE password_reset_tokens ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Ensure the admin_invitation_id column has a FK relationship to admin_invitations(id)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_prt_admin_invitation') THEN
        ALTER TABLE password_reset_tokens 
        ADD CONSTRAINT fk_prt_admin_invitation 
        FOREIGN KEY (admin_invitation_id) REFERENCES admin_invitations(id) ON DELETE CASCADE;
    END IF;
END $$;
