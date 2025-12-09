-- V3__alter_refresh_tokens_user_agent.sql
-- Increase user_agent column size to handle modern user agent strings

ALTER TABLE refresh_tokens ALTER COLUMN user_agent TYPE TEXT;

COMMENT ON COLUMN refresh_tokens.user_agent IS 'User agent string from the client (unlimited length)';
