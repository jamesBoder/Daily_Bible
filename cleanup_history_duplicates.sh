#!/bin/bash

# Script to remove duplicate history entries, keeping only the most recent view of each verse

echo "Cleaning up duplicate history entries..."

# Use sqlite3 to remove duplicates
sqlite3 backend/daily_bible.db <<EOF
-- Create a temporary table with unique verse entries (keeping the most recent)
CREATE TEMPORARY TABLE temp_history AS
SELECT 
    h1.id,
    h1.user_id,
    h1.verse_id,
    h1.viewed_at,
    h1.created_at,
    h1.updated_at
FROM histories h1
INNER JOIN (
    SELECT user_id, verse_id, MAX(viewed_at) as max_viewed_at
    FROM histories
    WHERE deleted_at IS NULL
    GROUP BY user_id, verse_id
) h2 ON h1.user_id = h2.user_id 
    AND h1.verse_id = h2.verse_id 
    AND h1.viewed_at = h2.max_viewed_at
WHERE h1.deleted_at IS NULL;

-- Count duplicates before deletion
SELECT 'Total history entries before cleanup: ' || COUNT(*) FROM histories WHERE deleted_at IS NULL;
SELECT 'Unique entries to keep: ' || COUNT(*) FROM temp_history;

-- Delete all current history entries (soft delete by setting deleted_at)
UPDATE histories 
SET deleted_at = datetime('now')
WHERE deleted_at IS NULL;

-- Re-insert the unique entries with NULL deleted_at
INSERT INTO histories (id, created_at, updated_at, deleted_at, user_id, verse_id, viewed_at)
SELECT id, created_at, updated_at, NULL, user_id, verse_id, viewed_at
FROM temp_history;

-- Count after cleanup
SELECT 'Total history entries after cleanup: ' || COUNT(*) FROM histories WHERE deleted_at IS NULL;

-- Drop temporary table
DROP TABLE temp_history;

.quit
EOF

echo "Cleanup complete! Refresh your history page to see unique verses."
