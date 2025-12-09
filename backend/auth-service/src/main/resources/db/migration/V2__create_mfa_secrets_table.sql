-- V2__create_mfa_secrets_table.sql
-- Create the mfa_secrets table

CREATE TABLE IF NOT EXISTS mfa_secrets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    secret VARCHAR(500) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    enabled_at TIMESTAMP,
    backup_codes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient user lookup
CREATE INDEX idx_mfa_user_id ON mfa_secrets(user_id);
CREATE INDEX idx_mfa_enabled ON mfa_secrets(enabled);

-- Comments for documentation
COMMENT ON TABLE mfa_secrets IS 'Stores MFA (Multi-Factor Authentication) secrets for users';
COMMENT ON COLUMN mfa_secrets.id IS 'Unique identifier for the MFA secret (UUID)';
COMMENT ON COLUMN mfa_secrets.user_id IS 'Reference to the user (unique, one MFA secret per user)';
COMMENT ON COLUMN mfa_secrets.secret IS 'TOTP secret key (Base32 encoded)';
COMMENT ON COLUMN mfa_secrets.enabled IS 'Whether MFA is enabled for this user';
COMMENT ON COLUMN mfa_secrets.enabled_at IS 'Timestamp when MFA was enabled';
COMMENT ON COLUMN mfa_secrets.backup_codes IS 'Comma-separated encrypted backup codes';
COMMENT ON COLUMN mfa_secrets.created_at IS 'Timestamp when the MFA secret was created';
COMMENT ON COLUMN mfa_secrets.updated_at IS 'Timestamp when the MFA secret was last updated';
