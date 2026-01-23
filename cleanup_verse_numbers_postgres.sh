#!/bin/bash

# Cleanup script for removing verse numbers from PostgreSQL database
# Database: daily_bible_dev
# User: dailybible_user

echo "Starting verse number cleanup for PostgreSQL..."

# Database credentials from your .env
DB_USER="dailybible_user"
DB_NAME="daily_bible_dev"
DB_PASSWORD="test123"

# Find the Docker container running PostgreSQL
CONTAINER_ID=$(docker ps --filter "expose=5432" --format "{{.ID}}" | head -n 1)

if [ -z "$CONTAINER_ID" ]; then
    echo "Error: Could not find PostgreSQL Docker container"
    echo "Trying to find by name..."
    CONTAINER_ID=$(docker ps --format "{{.ID}} {{.Names}}" | grep -i postgres | awk '{print $1}' | head -n 1)
fi

if [ -z "$CONTAINER_ID" ]; then
    echo "Error: Could not find PostgreSQL Docker container"
    echo "Please run: docker ps"
    echo "And provide the container ID manually"
    exit 1
fi

echo "Found PostgreSQL container: $CONTAINER_ID"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Execute SQL to clean verse numbers
echo "Cleaning verse numbers from database..."
docker exec -i $CONTAINER_ID psql -U $DB_USER -d $DB_NAME <<EOF
-- Step 1: Remove leading verse numbers (e.g., "13I can do..." -> "I can do...")
UPDATE verses 
SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g')
WHERE text ~ '^\d+';

-- Step 2: Remove verse numbers after punctuation (e.g., ". 2 And..." -> ". And...")
UPDATE verses 
SET text = REGEXP_REPLACE(text, '([.;!?])\s*\d+\s+', '\1 ', 'g')
WHERE text ~ '[.;!?]\s*\d+\s+';

-- Step 3: Clean up multiple spaces
UPDATE verses 
SET text = REGEXP_REPLACE(text, '\s+', ' ', 'g')
WHERE text ~ '\s{2,}';

-- Step 4: Trim leading/trailing spaces
UPDATE verses 
SET text = TRIM(text);

-- Show results
SELECT COUNT(*) as "Total verses in database" FROM verses;

-- Show sample of cleaned verses
SELECT id, reference, LEFT(text, 80) as text_preview 
FROM verses 
ORDER BY id 
LIMIT 5;

-- Check if any verses still have leading numbers
SELECT COUNT(*) as "Verses still with leading numbers" 
FROM verses 
WHERE text ~ '^\d+';
EOF

echo ""
echo "Verse number cleanup complete!"
echo ""
echo "To verify, run:"
echo "curl -X GET http://localhost:8080/api/verses/daily -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""
echo "Expected: Text should NOT start with numbers like '13I can do...'"
echo "Should be: 'I can do all things through Christ...'"
