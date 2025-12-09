-- V4__alter_refresh_tokens_token.sql
-- Increase token column size to handle long JWT refresh tokens

ALTER TABLE refresh_tokens ALTER COLUMN token TYPE TEXT;

COMMENT ON COLUMN refresh_tokens.token IS 'JWT refresh token string (unlimited length)';
