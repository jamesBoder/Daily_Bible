-- Google OAuth columns to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN google_email VARCHAR(255);
ALTER TABLE users ADD COLUMN google_picture VARCHAR(500);
ALTER TABLE users ADD COLUMN is_google_linked BOOLEAN DEFAULT FALSE;

-- Make password nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Add index for faster Google ID lookups
CREATE INDEX idx_users_google_id ON users(google_id);