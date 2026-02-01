-- Drop the existing unique constraint on google_id column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_google_id_key;

-- Drop the existing index
DROP INDEX IF EXISTS idx_users_google_id;

-- Create a partial unique index that only applies to non-NULL google_id values
-- This allows multiple users with NULL google_id (regular email/password users)
-- while ensuring Google IDs are unique when present
CREATE UNIQUE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
