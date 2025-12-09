-- V2__seed_initial_admin.sql
-- Create an initial admin user for testing/bootstrapping
-- Password is 'admin123' (BCrypt hash with strength 10)

INSERT INTO users (id, email, first_name, last_name, password_hash, status, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@allcode.com',
    'System',
    'Administrator',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'ADMIN');

-- Add a comment
COMMENT ON TABLE users IS 'Initial admin user created with email: admin@allcode.com and password: admin123';
