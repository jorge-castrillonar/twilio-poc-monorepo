-- V1__create_refresh_tokens_table.sql
-- Create the refresh_tokens table

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP,
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX idx_refresh_token ON refresh_tokens(token);
CREATE INDEX idx_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_revoked ON refresh_tokens(revoked);

-- Comments for documentation
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for user authentication';
COMMENT ON COLUMN refresh_tokens.id IS 'Unique identifier for the refresh token (UUID)';
COMMENT ON COLUMN refresh_tokens.token IS 'JWT refresh token string (unique)';
COMMENT ON COLUMN refresh_tokens.user_id IS 'Reference to the user who owns this token';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Expiration timestamp for the token';
COMMENT ON COLUMN refresh_tokens.revoked IS 'Whether the token has been revoked';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Timestamp when the token was revoked';
COMMENT ON COLUMN refresh_tokens.user_agent IS 'User agent string from the client';
COMMENT ON COLUMN refresh_tokens.ip_address IS 'IP address of the client';
COMMENT ON COLUMN refresh_tokens.created_at IS 'Timestamp when the token was created';
