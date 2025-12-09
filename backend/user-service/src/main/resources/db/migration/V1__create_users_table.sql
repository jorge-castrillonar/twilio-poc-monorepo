-- V1__create_users_table.sql
-- Create the users table

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for fast lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on status for filtering
CREATE INDEX idx_users_status ON users(status);

-- Create index on created_at for sorting
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create the user_roles table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role)
);

-- Create index on role for filtering
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user (UUID)';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password';
COMMENT ON COLUMN users.status IS 'User account status (ACTIVE, INACTIVE, SUSPENDED, DELETED)';
COMMENT ON COLUMN users.created_at IS 'Timestamp when the user was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when the user was last updated';

COMMENT ON TABLE user_roles IS 'Stores user role assignments (many-to-many)';
COMMENT ON COLUMN user_roles.user_id IS 'Reference to the user';
COMMENT ON COLUMN user_roles.role IS 'Role assigned to the user (ADMIN, USER, MANAGER, AGENT)';
