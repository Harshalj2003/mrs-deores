-- Admin Invitation System (Secure Enrollment)
CREATE TABLE admin_invitations (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    invite_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for admin registration attempts (rate limiting + security)
CREATE TABLE admin_auth_attempts (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(50),
    ip_address VARCHAR(45),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_auth_attempts_ip ON admin_auth_attempts(ip_address, attempted_at);
CREATE INDEX idx_admin_invitations_lookup ON admin_invitations(email, phone, invite_token);
